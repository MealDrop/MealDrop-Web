import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Coffee } from "lucide-react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import DishFormModal from "../components/DishFormModal.jsx";
import HolidayModal from "../components/HolidayModal.jsx";
import "./styles/DashboardPage.css";

export default function DashboardPage() {
  const { restaurant, setRestaurant } = useAuth();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [editing, setEditing] = useState(null); // dish being edited, or "new"
  const [holidayOpen, setHolidayOpen] = useState(false);

  useEffect(() => {
    if (!restaurant) return;
    api
      .getDishes(restaurant.id)
      .then(setDishes)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [restaurant?.id]);

  if (!restaurant) return <Navigate to="/setup" replace />;

  async function toggleOpen() {
    try {
      const updated = await api.updateRestaurant(restaurant.id, { isOpen: !restaurant.isOpen, closedUntil: null });
      setRestaurant(updated);
    } catch (err) {
      alert(err.response?.data?.message || "Could not update — check your connection and try again.");
    }
  }

  async function saveHoliday(date) {
    try {
      const updated = await api.updateRestaurant(restaurant.id, { isOpen: false, closedUntil: date });
      setRestaurant(updated);
      setHolidayOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Could not save — check your connection and try again.");
    }
  }

  async function saveDish(form) {
    try {
      if (editing && editing !== "new") {
        const updated = await api.updateDish(editing.id, form);
        setDishes((ds) => ds.map((d) => (d.id === editing.id ? updated : d)));
      } else {
        const created = await api.createDish({ ...form, restaurant: restaurant.id });
        setDishes((ds) => [...ds, created]);
      }
      setEditing(null);
    } catch (err) {
      alert(err.response?.data?.message || "Could not save this dish — check your connection and try again.");
    }
  }

  async function removeDish(id) {
    if (!window.confirm("Delete this dish?")) return;
    try {
      await api.deleteDish(id);
      setDishes((ds) => ds.filter((d) => d.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete this dish — check your connection and try again.");
    }
  }

  return (
    <div className="page dashboard-page">
      <div className="container">
        {loadError && <p className="banner banner-error">Couldn't load your menu — check your connection and refresh.</p>}

        <div className="dash-header card">
          <div>
            <p className="eyebrow">{(restaurant.cuisines || []).join(" · ")}</p>
            <h1>{restaurant.name}</h1>
            <p className="muted">{restaurant.address}</p>
            <p className="muted">{restaurant.openingTime} – {restaurant.closingTime}</p>
          </div>
          <div className="dash-header-actions">
            <button className="btn btn-outline btn-sm" onClick={() => setHolidayOpen(true)}>
              <Coffee size={15} /> Take a break
            </button>
            <button className={`switch ${restaurant.isOpen ? "on" : ""}`} onClick={toggleOpen} aria-label="Toggle open">
              <span className="switch-knob" />
            </button>
            <span className={`badge ${restaurant.isOpen ? "" : "badge-closed"}`}>
              {restaurant.isOpen ? "Open" : restaurant.closedUntil ? `Closed till ${restaurant.closedUntil}` : "Closed"}
            </span>
          </div>
        </div>

        <div className="results-head">
          <h2 className="section-title">Menu</h2>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing("new")}>
            <Plus size={15} /> Add dish
          </button>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : dishes.length === 0 ? (
          <div className="empty-state">
            <h2>No dishes yet</h2>
            <p>Add your first dish to start receiving orders.</p>
          </div>
        ) : (
          <div className="dish-manage-list">
            {dishes.map((d) => (
              <div className="dish-manage-row card" key={d.id}>
                {d.imageUrl ? (
                  <img className="dish-thumb" src={d.imageUrl} alt={d.name} />
                ) : (
                  <div className="dish-thumb-placeholder">{(d.name || "D")[0].toUpperCase()}</div>
                )}
                <div className="dish-manage-info">
                  <h4>{d.name}</h4>
                  <p className="muted">{d.category} · ₹{d.price}{!d.isAvailable && " · Unavailable"}</p>
                </div>
                <div className="dish-manage-actions">
                  <button className="btn-icon" onClick={() => setEditing(d)}><Pencil size={16} /></button>
                  <button className="btn-icon" onClick={() => removeDish(d.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <DishFormModal
          initial={editing !== "new" ? editing : null}
          onClose={() => setEditing(null)}
          onSave={saveDish}
        />
      )}
      {holidayOpen && (
        <HolidayModal current={restaurant.closedUntil} onClose={() => setHolidayOpen(false)} onSave={saveHoliday} />
      )}
    </div>
  );
}
