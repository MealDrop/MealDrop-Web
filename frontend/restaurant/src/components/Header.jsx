import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  User,
  LayoutDashboard,
  ClipboardList,
  LifeBuoy,
  MapPin,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/Header.css";

export default function Header({ onLoginClick, onSupportClick }) {
  const { user, restaurant } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function go(path) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-left">
          <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-mark">M</span>
            Meal<span className="logo-accent">Drop</span>
            <span className="partner-tag">Partner</span>
          </Link>
          {restaurant?.address && (
            <div className="location-pill">
              <MapPin size={14} />
              <span>{restaurant.address}</span>
            </div>
          )}
        </div>

        {user && (
          <nav className="nav-actions desktop-only">
            <button className="nav-link" onClick={() => go("/dashboard")}>
              <LayoutDashboard size={17} /> Dashboard
            </button>
            <button className="nav-link" onClick={() => go("/orders")}>
              <ClipboardList size={17} /> Orders
            </button>
            <button className="nav-link" onClick={onSupportClick}>
              <LifeBuoy size={17} /> Support
            </button>
            <button className="nav-link" onClick={() => go("/profile")}>
              <User size={17} /> {user.name || "Profile"}
            </button>
          </nav>
        )}

        {!user && (
          <button
            className="btn btn-primary btn-sm desktop-only"
            onClick={onLoginClick}
          >
            Partner login
          </button>
        )}

        {user && (
          <button
            className="hamburger mobile-only"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </div>

      {menuOpen && user && (
        <div className="mobile-menu mobile-only">
          <button className="mobile-menu-item" onClick={() => go("/dashboard")}>
            Dashboard
          </button>
          <button className="mobile-menu-item" onClick={() => go("/orders")}>
            Orders
          </button>
          <button className="mobile-menu-item" onClick={() => go("/profile")}>
            Profile
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => {
              setMenuOpen(false);
              onSupportClick();
            }}
          >
            Support
          </button>
        </div>
      )}
    </header>
  );
}
