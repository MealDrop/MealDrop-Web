import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, LogOut } from "lucide-react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/ProfilePage.css";

export default function ProfilePage({ onLoginClick, onSupportClick }) {
  const { user, restaurant, setUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="page">
        <div className="container empty-state">
          <h2>You're not logged in</h2>
          <p className="muted">Log in to manage your restaurant.</p>
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
      !window.confirm(
        "Delete your account permanently? This also removes your restaurant and menu.",
      )
    )
      return;
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
    <div className="page profile-page">
      <div className="container profile-page-layout">
        <div className="card profile-header">
          <div className="profile-avatar">
            {(form.name || user.email)[0].toUpperCase()}
          </div>
          <div>
            <h1>{form.name || "Your profile"}</h1>
            <p className="muted">
              {user.email}
              {restaurant ? ` · ${restaurant.name}` : ""}
            </p>
          </div>
        </div>

        <div className="card profile-section">
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
              <label className="field-label">Phone (optional)</label>
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

        <div className="card profile-section">
          {saveError && (
            <p className="field-error" style={{ marginBottom: 12 }}>
              {saveError}
            </p>
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
              <LifeBuoy size={15} /> Support
            </button>
            <button className="btn btn-outline" onClick={logout}>
              <LogOut size={15} /> Log out
            </button>
          </div>

          <div className="danger-zone">
            <p className="danger-zone-label">Danger zone</p>
            <button className="btn-danger-text" onClick={handleDelete}>
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
