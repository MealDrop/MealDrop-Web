import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "./styles/RestaurantCard.css";

const AVATAR_COLORS = [
  "avatar-emerald",
  "avatar-gold",
  "avatar-terracotta",
  "avatar-navy",
  "avatar-plum",
];

function colorFor(name) {
  const sum = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export default function RestaurantCard({ restaurant, matched, reason }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className={`rest-card card ${matched ? "matched" : ""}`}
    >
      <div className="rest-card-top">
        <div className={`avatar ${colorFor(restaurant.name)}`}>
          {restaurant.name[0]}
        </div>

        <span className={`badge ${restaurant.isOpen ? "" : "badge-closed"}`}>
          {restaurant.isOpen
            ? "Open"
            : restaurant.closedUntil
              ? `Closed till ${restaurant.closedUntil}`
              : "Closed"}
        </span>
      </div>

      <h3 className="rest-card-name">{restaurant.name}</h3>

      <div className="rest-card-chips">
        {(restaurant.cuisines || []).slice(0, 3).map((c) => (
          <span className="chip" key={c}>
            {c}
          </span>
        ))}
      </div>

      <p className="rest-price">₹{restaurant.priceForTwo} for two</p>

      {reason && (
        <p className="rest-card-reason">
          <Sparkles size={11} />
          {reason}
        </p>
      )}
    </Link>
  );
}
