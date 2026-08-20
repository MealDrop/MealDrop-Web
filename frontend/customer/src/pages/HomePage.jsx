import { useEffect, useMemo, useState } from "react";
import { Sparkles, X, SlidersHorizontal } from "lucide-react";
import * as api from "../api.js";
import { smartSearch } from "../smartSearch.js";
import { demoRestaurants, demoDishes } from "../data/demoData.js";
import RestaurantCard from "../components/RestaurantCard.jsx";
import DishResultCard from "../components/DishResultCard.jsx";
import "./styles/HomePage.css";

const EXAMPLES = ["Something Chinese", "Biryani under 300", "Pizza tonight"];
const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "costLow", label: "Cost: low to high" },
  { key: "costHigh", label: "Cost: high to low" },
  { key: "name", label: "Name: A to Z" },
];

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [dishIndex, setDishIndex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const [query, setQuery] = useState("");
  const [aiState, setAiState] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [openOnly, setOpenOnly] = useState(true);

  useEffect(() => {
    api
      .getRestaurants()
      .then(setRestaurants)
      .catch((err) => {
        if (api.isBackendUnreachable(err)) {
          setOffline(true);
          setRestaurants(demoRestaurants);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!restaurants.length) return;
    if (offline) {
      const idx = restaurants.flatMap((r) =>
        (demoDishes[r.id] || []).map((d) => ({
          ...d,
          restaurantId: r.id,
          restaurantName: r.name,
          restaurantIsOpen: r.isOpen,
        })),
      );
      setDishIndex(idx);
      return;
    }
    Promise.all(
      restaurants.map((r) =>
        api
          .getRestaurant(r.id)
          .then((data) =>
            data.dishes.map((d) => ({
              ...d,
              restaurantId: r.id,
              restaurantName: r.name,
              restaurantIsOpen: r.isOpen,
            })),
          )
          .catch(() => []),
      ),
    ).then((lists) => setDishIndex(lists.flat()));
  }, [restaurants, offline]);

  function runSearch(text) {
    const q = text ?? query;
    if (!q.trim()) return;
    setQuery(q);
    setAiState(smartSearch(q, restaurants, dishIndex));
  }
  function clearSearch() {
    setAiState(null);
    setQuery("");
  }

  const visibleRestaurants = useMemo(() => {
    let base = aiState ? aiState.restaurants || [] : restaurants;
    if (openOnly) base = base.filter((r) => r.isOpen);
    const sorted = [...base];
    if (sortBy === "costLow")
      sorted.sort((a, b) => (a.priceForTwo || 0) - (b.priceForTwo || 0));
    else if (sortBy === "costHigh")
      sorted.sort((a, b) => (b.priceForTwo || 0) - (a.priceForTwo || 0));
    else if (sortBy === "name")
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [aiState, restaurants, openOnly, sortBy]);

  const showRestaurants =
    !aiState || aiState.type === "restaurants" || aiState.type === "mixed";
  const showDishes =
    aiState && (aiState.type === "dishes" || aiState.type === "mixed");

  return (
    <div className="page">
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Order in Barasat</p>
          <h1 className="hero-title">
            Tell us what you're craving.
            <br />
            We'll find the kitchen.
          </h1>
          <p className="muted hero-sub">
            Search by restaurant name, or describe what you want — the Smart
            Finder reads your query and matches restaurants and dishes for you.
          </p>

          <div className="finder">
            <div className="finder-box">
              <Sparkles size={18} className="finder-icon" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder='Try "biryani under 300" or "something Chinese"'
              />
              {aiState && (
                <button
                  className="finder-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <button
                className="btn btn-primary btn-sm finder-go"
                onClick={() => runSearch()}
              >
                Find
              </button>
            </div>
            <div className="finder-examples">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  className="chip finder-example"
                  onClick={() => runSearch(ex)}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {offline && (
          <p className="banner">
            Showing demo restaurants — the backend isn't reachable, so live data
            isn't loading.
          </p>
        )}

        {aiState && (
          <div className="finder-result-bar">
            <span>
              <Sparkles size={14} /> {aiState.message}
            </span>
            <button className="btn-ghost btn-sm" onClick={clearSearch}>
              Clear & browse all
            </button>
          </div>
        )}

        {loading ? (
          <div className="spinner" />
        ) : (
          <>
            {aiState?.type === "empty" && (
              <div className="empty-state">
                <h2>Nothing matched that search</h2>
                <p>Try a different dish, cuisine, or a higher budget.</p>
              </div>
            )}

            {showDishes && (
              <section className="results-section">
                <div className="results-head">
                  <h2 className="section-title">Matched dishes</h2>
                  <span className="muted">
                    {aiState.dishes.length} result
                    {aiState.dishes.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="dish-results-list">
                  {aiState.dishes.map((d) => (
                    <DishResultCard
                      key={`${d.restaurantId}-${d.id}`}
                      dish={d}
                    />
                  ))}
                </div>
              </section>
            )}

            {showRestaurants && visibleRestaurants.length > 0 && (
              <section className="results-section">
                <div className="results-head">
                  <h2 className="section-title">
                    {aiState ? "Matched restaurants" : "All restaurants"}
                  </h2>
                  <span className="muted">
                    {visibleRestaurants.length} result
                    {visibleRestaurants.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {!aiState && (
                  <div className="filter-bar">
                    <div className="filter-sort">
                      <button
                        className="filter-sort-btn"
                        onClick={() => setSortOpen((s) => !s)}
                      >
                        <SlidersHorizontal size={13} />{" "}
                        {SORTS.find((s) => s.key === sortBy).label}
                      </button>
                      {sortOpen && (
                        <div className="filter-sort-menu">
                          {SORTS.map((o) => (
                            <button
                              key={o.key}
                              className={`filter-sort-item ${sortBy === o.key ? "active" : ""}`}
                              onClick={() => {
                                setSortBy(o.key);
                                setSortOpen(false);
                              }}
                            >
                              {o.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      className={`chip filter-toggle ${openOnly ? "active" : ""}`}
                      onClick={() => setOpenOnly((v) => !v)}
                    >
                      Open now
                    </button>
                  </div>
                )}

                <div className="rest-grid">
                  {visibleRestaurants.map((r) => (
                    <RestaurantCard
                      key={r.id}
                      restaurant={r}
                      matched={!!aiState}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="logo footer-logo">
            <span className="logo-mark">M</span>Meal
            <span className="logo-accent">Drop</span>
          </div>
          <p className="muted">
            Order from restaurants in Barasat, with a Smart Finder to match your
            craving.
          </p>
          <p className="muted footer-bottom">© 2026 MealDrop</p>
        </div>
      </footer>
    </div>
  );
}
