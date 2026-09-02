import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import * as api from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import DishThumb from "../components/DishThumb.jsx";
import "./styles/RestaurantPage.css";

export default function RestaurantPage({ onCartClick }) {
  const { id } = useParams();
  const location = useLocation();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const { items, addItem, changeQty, count, subtotal } = useCart();

  const highlightRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(false);

    api
      .getRestaurant(id)
      .then((data) => {
        setRestaurant(data.restaurant);
        setDishes(data.dishes);
      })
      .catch(() => setLoadError(true))
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
    return items.find((item) => item.id === dishId)?.qty || 0;
  }

  if (loading) {
    return (
      <div className="restaurant-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="empty-state">
        <h2>Couldn't load this restaurant</h2>
        <p>Check your connection and try again.</p>
      </div>
    );
  }

  if (!restaurant) {
    return <div className="empty-state">Restaurant not found.</div>;
  }

  const highlightDish = location.state?.highlightDish;

  return (
    <div className="page restaurant-menu-page">
      <div className="container restaurant-container">
        <div className="rest-header">
          <div className="restaurant-heading">
            <p className="eyebrow">{(restaurant.cuisines || []).join(" · ")}</p>

            <h1>{restaurant.name}</h1>

            <p className="muted restaurant-meta">
              ₹{restaurant.priceForTwo} for two ·{" "}
              {restaurant.address || restaurant.area}
            </p>
          </div>

          <span
            className={`restaurant-status ${
              restaurant.isOpen ? "" : "badge-closed"
            }`}
          >
            <span className="status-dot" />

            {restaurant.isOpen
              ? "Open now"
              : restaurant.closedUntil
                ? `Closed till ${restaurant.closedUntil}`
                : "Closed"}
          </span>
        </div>

        <div className="menu-heading">
          <h2 className="section-title">Menu</h2>
          <div className="menu-heading-line" />
        </div>

        <div className="menu-list">
          {dishes.map((dish) => {
            const qty = qtyOf(dish.id);
            const isHighlighted = dish.id === highlightDish;

            return (
              <div
                className={`dish-row ${isHighlighted ? "highlighted" : ""}`}
                key={dish.id}
                ref={isHighlighted ? highlightRef : null}
              >
                <div className="dish-info">
                  <DishThumb name={dish.name} imageUrl={dish.imageUrl} />

                  <div className="dish-content">
                    <div className="dish-title">
                      <span
                        className={`veg-dot ${dish.isVeg ? "veg" : "nonveg"}`}
                        aria-label={
                          dish.isVeg ? "Vegetarian" : "Non-vegetarian"
                        }
                      />

                      <h4>{dish.name}</h4>
                    </div>

                    {dish.description && (
                      <p className="muted dish-description">
                        {dish.description}
                      </p>
                    )}

                    <p className="dish-price">₹{dish.price}</p>
                  </div>
                </div>

                <div className="dish-action">
                  {qty === 0 ? (
                    <button
                      type="button"
                      className="dish-add"
                      disabled={!restaurant.isOpen}
                      onClick={() =>
                        addItem(dish, restaurant.id, restaurant.name)
                      }
                    >
                      Add
                    </button>
                  ) : (
                    <div className="stepper">
                      <button
                        type="button"
                        aria-label={`Decrease ${dish.name} quantity`}
                        onClick={() => changeQty(dish.id, -1)}
                      >
                        −
                      </button>

                      <span>{qty}</span>

                      <button
                        type="button"
                        aria-label={`Increase ${dish.name} quantity`}
                        onClick={() => changeQty(dish.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {count > 0 && (
          <button type="button" className="cart-float" onClick={onCartClick}>
            <span className="cart-count">{count}</span>

            <span>
              {count} item{count !== 1 ? "s" : ""}
            </span>

            <span className="cart-separator">·</span>

            <span>₹{subtotal}</span>

            <span className="cart-view">View cart</span>

            <span className="cart-arrow">›</span>
          </button>
        )}
      </div>
    </div>
  );
}
