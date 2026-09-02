import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/SetupPage.css";

export default function SetupPage() {
  const { setRestaurant } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    cuisines: "",
    priceForTwo: "",
    address: "",
    openingTime: "10:00",
    closingTime: "22:00",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) {
      return setError("Restaurant name and address are required.");
    }
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      cuisines: form.cuisines
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      priceForTwo: Number(form.priceForTwo) || 0,
      address: form.address,
      openingTime: form.openingTime,
      closingTime: form.closingTime,
      isOpen: true,
    };
    try {
      const created = await api.createRestaurant(payload);
      setRestaurant(created);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not create restaurant — check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page setup-page">
      <div className="container setup-layout">
        <div className="card setup-card">
          <p className="eyebrow">Get started</p>
          <h1>Set up your restaurant</h1>
          <p className="muted" style={{ marginBottom: 20 }}>
            This is what customers see before they open your menu.
          </p>

          <form onSubmit={submit}>
            <label className="field-label">Restaurant name</label>
            <input
              className="field-input"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />

            <label className="field-label">Cuisines (comma separated)</label>
            <input
              className="field-input"
              placeholder="North Indian, Mughlai"
              value={form.cuisines}
              onChange={(e) => set("cuisines", e.target.value)}
            />

            <label className="field-label">Approx. price for two (₹)</label>
            <input
              className="field-input"
              type="number"
              min="0"
              value={form.priceForTwo}
              onChange={(e) => set("priceForTwo", e.target.value)}
            />

            <label className="field-label">Restaurant address</label>
            <textarea
              className="field-input"
              rows={3}
              required
              placeholder="Shop no, street, landmark, area"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
            <p className="field-hint">
              Used to show your location to customers — live map pickup comes
              later.
            </p>

            <div className="form-row" style={{ marginTop: 14 }}>
              <div>
                <label className="field-label">Opening time</label>
                <input
                  className="field-input"
                  type="time"
                  value={form.openingTime}
                  onChange={(e) => set("openingTime", e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">Closing time</label>
                <input
                  className="field-input"
                  type="time"
                  value={form.closingTime}
                  onChange={(e) => set("closingTime", e.target.value)}
                />
              </div>
            </div>

            {error && <p className="field-error">{error}</p>}
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 20 }}
              disabled={saving}
            >
              {saving ? "Creating..." : "Create restaurant"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
