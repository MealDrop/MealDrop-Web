import { useEffect, useMemo, useState } from "react";
import { Sparkles, X, SlidersHorizontal, Loader2 } from "lucide-react";
import * as api from "../api.js";
import RestaurantCard from "../components/RestaurantCard.jsx";
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [query, setQuery] = useState("");
  const [aiState, setAiState] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [sortOpen, setSortOpen] = useState(false);
  const [openOnly, setOpenOnly] = useState(true);

  useEffect(() => {
    api
      .getRestaurants()
      .then(setRestaurants)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  async function runSearch(text) {
    const q = text ?? query;

    if (!q.trim()) return;

    setQuery(q);
    setSearching(true);
    setSearchError("");

    try {
      const { matches, message } = await api.smartSearch(q);

      const byId = Object.fromEntries(restaurants.map((r) => [r.id, r]));

      const reasons = {};

      const matched = matches
        .map((m) => {
          const r = byId[m.restaurantId];

          if (r) {
            reasons[m.restaurantId] = m.reason;
          }

          return r;
        })
        .filter(Boolean);

      setAiState({
        restaurants: matched,
        reasons,
        message:
          message ||
          `Found ${matched.length} match${matched.length !== 1 ? "es" : ""}`,
      });
    } catch (err) {
      setSearchError(
        err.response?.data?.message ||
          "Search isn't working right now — try again in a moment.",
      );
    } finally {
      setSearching(false);
    }
  }

  function clearSearch() {
    setAiState(null);
    setSearchError("");
    setQuery("");
  }

  const visibleRestaurants = useMemo(() => {
    let base = aiState ? aiState.restaurants : restaurants;

    if (openOnly) {
      base = base.filter((r) => r.isOpen);
    }

    const sorted = [...base];

    if (sortBy === "costLow") {
      sorted.sort((a, b) => (a.priceForTwo || 0) - (b.priceForTwo || 0));
    } else if (sortBy === "costHigh") {
      sorted.sort((a, b) => (b.priceForTwo || 0) - (a.priceForTwo || 0));
    } else if (sortBy === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
  }, [aiState, restaurants, openOnly, sortBy]);

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
                disabled={searching}
              >
                {searching ? <Loader2 size={14} className="spin" /> : "Find"}
              </button>
            </div>

            <div className="finder-examples">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  className="chip finder-example"
                  onClick={() => runSearch(ex)}
                  disabled={searching}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {loadError && (
          <p className="banner banner-error">
            Couldn't load restaurants — check that the backend is running and
            reachable.
          </p>
        )}

        {searchError && <p className="banner banner-error">{searchError}</p>}

        {aiState && (
          <div className="finder-result-bar">
            <span>
              <Sparkles size={14} />
              {aiState.message}
            </span>

            <button className="btn-ghost btn-sm" onClick={clearSearch}>
              Clear & browse all
            </button>
          </div>
        )}

        {loading || searching ? (
          <div className="spinner" />
        ) : restaurants.length === 0 && !aiState ? (
          <div className="empty-state">
            <h2>No restaurants here yet</h2>
            <p>
              Once restaurant partners join MealDrop in Barasat, they'll show up
              here.
            </p>
          </div>
        ) : aiState && visibleRestaurants.length === 0 ? (
          <div className="empty-state">
            <h2>Nothing matched that search</h2>
            <p>Try a different dish, cuisine, or a higher budget.</p>
          </div>
        ) : (
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
                    <SlidersHorizontal size={13} />
                    {SORTS.find((s) => s.key === sortBy).label}
                  </button>

                  {sortOpen && (
                    <div className="filter-sort-menu">
                      {SORTS.map((o) => (
                        <button
                          key={o.key}
                          className={`filter-sort-item ${
                            sortBy === o.key ? "active" : ""
                          }`}
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
                  reason={aiState?.reasons?.[r.id]}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="logo footer-logo">
            <span className="logo-mark">M</span>
            Meal
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
