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

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <div className="header-left">
            <Link to="/" className="logo" onClick={closeMenu}>
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

          {user ? (
            <>
              <nav className="nav-actions desktop-only">
                <button className="nav-link" onClick={() => go("/dashboard")}>
                  <LayoutDashboard size={17} />
                  Dashboard
                </button>

                <button className="nav-link" onClick={() => go("/orders")}>
                  <ClipboardList size={17} />
                  Orders
                </button>

                <button className="nav-link" onClick={onSupportClick}>
                  <LifeBuoy size={17} />
                  Support
                </button>

                <button className="nav-link" onClick={() => go("/profile")}>
                  <User size={17} />
                  {user.name || "Profile"}
                </button>
              </nav>

              <button
                className="hamburger mobile-only"
                onClick={() => setMenuOpen((value) => !value)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary btn-sm desktop-only"
              onClick={onLoginClick}
            >
              Partner login
            </button>
          )}

          {!user && (
            <button
              className="hamburger mobile-only"
              onClick={onLoginClick}
              aria-label="Partner login"
            >
              <User size={21} />
            </button>
          )}
        </div>
      </header>

      {menuOpen && user && (
        <div className="mobile-navigation mobile-only">
          <button
            className="mobile-backdrop"
            onClick={closeMenu}
            aria-label="Close navigation"
          />

          <nav className="mobile-menu">
            {restaurant?.address && (
              <div className="location-pill mobile-menu-location">
                <MapPin size={14} />
                <span>{restaurant.address}</span>
              </div>
            )}

            <button
              className="mobile-menu-item"
              onClick={() => go("/dashboard")}
            >
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </button>

            <button className="mobile-menu-item" onClick={() => go("/orders")}>
              <ClipboardList size={17} />
              <span>Orders</span>
            </button>

            <button className="mobile-menu-item" onClick={() => go("/profile")}>
              <User size={17} />
              <span>Profile</span>
            </button>

            <button
              className="mobile-menu-item"
              onClick={() => {
                closeMenu();
                onSupportClick();
              }}
            >
              <LifeBuoy size={17} />
              <span>Support</span>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
