import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, LogOut, ShoppingBag } from "lucide-react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/ProfilePage.css";

export default function ProfilePage({ onLoginClick, onSupportClick }) {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    username: "",
    phone: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      username: user.username || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    api
      .getMyOrders()
      .then(setOrders)
      .catch(() => {});
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
    setSaved(false);
  }

  async function saveProfile() {
    setSaving(true);
    setSaveError("");

    try {
      const updated = await api.updateProfile(form);
      setUser(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          "Could not save changes — check your connection.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (
      !window.confirm("Delete your account permanently? This can't be undone.")
    ) {
      return;
    }

    try {
      await api.deleteMyAccount();
      logout();
      navigate("/");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Could not delete account — check your connection and try again.",
      );
    }
  }

  return (
    <div className="page">
      <div className="container profile-page-layout">
        <div className="card profile-header">
          <div className="profile-avatar">
            {(form.name || user.email)[0].toUpperCase()}
          </div>

          <div className="profile-header-info">
            <h1>{form.name || "Your profile"}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>

        <div className="card profile-section profile-personal">
          <h2>Personal details</h2>

          <p className="profile-section-sub">Your name and contact info.</p>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Full name</label>

              <input
                className="profile-input"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Username</label>

              <input
                className="profile-input"
                value={form.username}
                onChange={(e) => updateField("username", e.target.value)}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Email</label>

              <input className="profile-input" value={user.email} disabled />
            </div>

            <div className="field-group">
              <label className="field-label">Phone Number</label>

              <input
                className="profile-input"
                type="tel"
                placeholder="10-digit phone number"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card profile-section profile-address">
          <h2>Delivery address</h2>

          <p className="profile-section-sub">
            Used to pre-fill checkout — you can still edit it per order.
          </p>

          <textarea
            className="profile-input"
            rows={3}
            placeholder="House no, street, area..."
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
          />
        </div>

        <div className="card profile-section profile-account">
          {saveError && (
            <p className="field-error profile-save-error">{saveError}</p>
          )}

          <div className="account-actions">
            <button
              className="btn btn-primary"
              disabled={saving}
              onClick={saveProfile}
            >
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
            </button>

            <button className="btn btn-outline" onClick={onSupportClick}>
              <LifeBuoy size={15} />
              Support
            </button>

            <button className="btn btn-outline" onClick={logout}>
              <LogOut size={15} />
              Log out
            </button>
          </div>

          <div className="danger-zone">
            <p className="danger-zone-label">Danger zone</p>

            <button className="btn-danger-text" onClick={handleDelete}>
              Delete account
            </button>
          </div>
        </div>

        <div className="card profile-section profile-orders">
          <h2>Order history</h2>

          <p className="profile-section-sub">Your past MealDrop orders.</p>

          {orders.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty-icon">
                <ShoppingBag size={38} strokeWidth={1.7} />
              </div>

              <h3>No orders yet</h3>

              <p className="muted">
                Once you place an order, it'll show up here.
              </p>
            </div>
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
