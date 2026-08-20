import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy } from "lucide-react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/ProfilePage.css";

export default function ProfilePage({ onLoginClick, onSupportClick }) {
  const { user, setUser, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [offline, setOffline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      address: user.address || "",
    });
    api
      .getMyOrders()
      .then(setOrders)
      .catch((err) => {
        if (api.isBackendUnreachable(err)) setOffline(true);
      });
  }, [user]);

  if (!user) {
    return (
      <div className="page">
        <div className="container empty-state">
          <h2>You're not logged in</h2>
          <p className="muted">Log in to see your profile and orders.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 18 }}
            onClick={onLoginClick}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const updated = await api.updateProfile(form);
      setUser({ ...updated, ...form });
    } catch (err) {
      if (api.isBackendUnreachable(err)) setUser(form);
      else alert("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete your account permanently?")) return;
    try {
      await api.deleteMyAccount();
    } catch (err) {
      if (!api.isBackendUnreachable(err))
        return alert("Could not delete account.");
    }
    logout();
    navigate("/");
  }

  return (
    <div className="page">
      <div className="container profile-layout">
        <div className="card profile-card">
          <h2>My profile</h2>
          {offline && (
            <p className="banner">
              Backend not reachable — changes here are saved locally only.
            </p>
          )}

          <label className="field-label">Full name</label>
          <input
            className="field-input"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />

          <label className="field-label">Username</label>
          <input
            className="field-input"
            value={form.username}
            onChange={(e) => updateField("username", e.target.value)}
          />

          <label className="field-label">Phone</label>
          <input className="field-input" value={user.phone} disabled />

          <label className="field-label">Email</label>
          <input
            className="field-input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <label className="field-label">Delivery address</label>
          <textarea
            className="field-input"
            rows={3}
            placeholder="House no, street, area..."
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />

          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            disabled={saving}
            onClick={saveProfile}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          <div className="profile-actions">
            <button className="btn btn-outline" onClick={onSupportClick}>
              <LifeBuoy size={15} /> Support
            </button>
            <button className="btn btn-outline" onClick={logout}>
              Log out
            </button>
            <button
              className="btn"
              style={{ color: "var(--terracotta)" }}
              onClick={handleDelete}
            >
              Delete account
            </button>
          </div>
        </div>

        <div className="card orders-card">
          <h2>Order history</h2>
          {orders.length === 0 ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((o) => (
                <div className="order-row" key={o.id}>
                  <div>
                    <h4>{o.restaurantName}</h4>
                    <p className="muted">
                      {o.items?.length} items · ₹{o.total}
                    </p>
                  </div>
                  <span className="badge">{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
