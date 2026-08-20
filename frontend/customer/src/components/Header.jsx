import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, X, MapPin, LifeBuoy } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import "./styles/Header.css";
const DELIVERY_AREA = "Barasat, West Bengal";

export default function Header({ onCartClick, onLoginClick, onSupportClick }) {
  const { user } = useAuth();
  const { count } = useCart();
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
          </Link>
          <div className="location-pill">
            <MapPin size={14} />
            <span>{DELIVERY_AREA}</span>
          </div>
        </div>

        <nav className="nav-actions desktop-only">
          <button className="nav-link" onClick={onSupportClick}>
            <LifeBuoy size={17} />
            Support
          </button>
          <button className="nav-link cart-link" onClick={onCartClick}>
            <ShoppingBag size={18} />
            Cart
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
          {user ? (
            <Link to="/profile" className="nav-link">
              <User size={18} />
              {user.name || "Profile"}
            </Link>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onLoginClick}>
              Log in
            </button>
          )}
        </nav>

        <button
          className="hamburger mobile-only"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu mobile-only">
          <div className="mobile-menu-item location-pill">
            <MapPin size={14} /> <span>{DELIVERY_AREA}</span>
          </div>
          <button className="mobile-menu-item" onClick={() => go("/")}>
            Home
          </button>
          <button
            className="mobile-menu-item"
            onClick={() => {
              setMenuOpen(false);
              onCartClick();
            }}
          >
            Cart{" "}
            {count > 0 && <span className="cart-count static">{count}</span>}
          </button>
          {user ? (
            <button className="mobile-menu-item" onClick={() => go("/profile")}>
              Profile
            </button>
          ) : (
            <button
              className="mobile-menu-item"
              onClick={() => {
                setMenuOpen(false);
                onLoginClick();
              }}
            >
              Log in
            </button>
          )}
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
