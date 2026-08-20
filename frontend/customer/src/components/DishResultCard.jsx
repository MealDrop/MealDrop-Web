import { useNavigate } from "react-router-dom";
import "./styles/DishResultCard.css";
export default function DishResultCard({ dish }) {
  const navigate = useNavigate();

  function open() {
    navigate(`/restaurant/${dish.restaurantId}`, {
      state: { highlightDish: dish.id },
    });
  }

  return (
    <button className="dish-result card" onClick={open}>
      <span className={`veg-dot ${dish.isVeg ? "veg" : "nonveg"}`} />
      <div className="dish-result-body">
        <h4>{dish.name}</h4>
        <p className="muted">
          {dish.restaurantName} {!dish.restaurantIsOpen && "· Closed"}
        </p>
      </div>
      <span className="dish-result-price">₹{dish.price}</span>
    </button>
  );
}
