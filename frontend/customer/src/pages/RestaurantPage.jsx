import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import * as api from "../api.js";
import { demoRestaurants, demoDishes } from "../data/demoData.js";
import { useCart } from "../context/CartContext.jsx";
import "./styles/RestaurantPage.css";

export default function RestaurantPage({ onCartClick }) {
  const { id } = useParams();
  const location = useLocation();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const { items, addItem, changeQty, count, subtotal } = useCart();
  const highlightRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api
      .getRestaurant(id)
      .then((data) => {
        setRestaurant(data.restaurant);
        setDishes(data.dishes);
      })
      .catch((err) => {
        if (api.isBackendUnreachable(err)) {
          setOffline(true);
          setRestaurant(
            demoRestaurants.find((r) => r.id === id) || demoRestaurants[0],
          );
          setDishes(demoDishes[id] || demoDishes["demo-1"]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [dishes]);

  function qtyOf(dishId) {
    return items.find((i) => i.id === dishId)?.qty || 0;
  }

  if (loading) return <div className="spinner" />;
  if (!restaurant)
    return <div className="empty-state">Restaurant not found.</div>;

  const highlightDish = location.state?.highlightDish;

  return (
    <div className="page">
      <div className="container">
        {offline && (
          <p className="banner">
            Showing a demo menu — the backend isn't reachable, so live data
            isn't loading.
          </p>
        )}

        <div className="rest-header">
          <div>
            <p className="eyebrow">{(restaurant.cuisines || []).join(" · ")}</p>
            <h1>{restaurant.name}</h1>
            <p className="muted">
              ₹{restaurant.priceForTwo} for two ·{" "}
              {restaurant.address || restaurant.area}
            </p>
          </div>
          <span className={`badge ${restaurant.isOpen ? "" : "badge-closed"}`}>
            {restaurant.isOpen
              ? "Open now"
              : restaurant.closedUntil
                ? `Closed till ${restaurant.closedUntil}`
                : "Closed"}
          </span>
        </div>

        <h2 className="section-title">Menu</h2>
        <div className="menu-list">
          {dishes.map((dish) => {
            const qty = qtyOf(dish.id);
            const isHighlighted = dish.id === highlightDish;
            return (
              <div
                className={`dish-row card ${isHighlighted ? "highlighted" : ""}`}
                key={dish.id}
                ref={isHighlighted ? highlightRef : null}
              >
                <div className="dish-info">
                  <span
                    className={`veg-dot ${dish.isVeg ? "veg" : "nonveg"}`}
                  />
                  <div>
                    <h4>{dish.name}</h4>
                    {dish.description && (
                      <p className="muted">{dish.description}</p>
                    )}
                    <p className="dish-price">₹{dish.price}</p>
                  </div>
                </div>

                {qty === 0 ? (
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={!restaurant.isOpen}
                    onClick={() =>
                      addItem(dish, restaurant.id, restaurant.name)
                    }
                  >
                    Add
                  </button>
                ) : (
                  <div className="stepper">
                    <button onClick={() => changeQty(dish.id, -1)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => changeQty(dish.id, 1)}>+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {count > 0 && (
          <button className="cart-float btn btn-primary" onClick={onCartClick}>
            {count} item{count !== 1 ? "s" : ""} · ₹{subtotal} — View cart
          </button>
        )}
      </div>
    </div>
  );
}
