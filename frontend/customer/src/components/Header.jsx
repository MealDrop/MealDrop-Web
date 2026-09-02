import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  function go(path) {
    closeMenu();
    navigate(path);
  }

  function handleCart() {
    closeMenu();
    onCartClick();
  }

  function handleLogin() {
    closeMenu();
    onLoginClick();
  }

  function handleSupport() {
    closeMenu();
    onSupportClick();
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="header-left">
          <Link to="/" className="logo" onClick={closeMenu}>
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
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-navigation mobile-only">
          <button
            className="mobile-backdrop"
            onClick={closeMenu}
            aria-label="Close menu"
          />

          <div className="mobile-menu">
            <div className="mobile-menu-location location-pill">
              <MapPin size={15} />
              <span>{DELIVERY_AREA}</span>
            </div>

            <button className="mobile-menu-item" onClick={() => go("/")}>
              Home
            </button>

            <button className="mobile-menu-item" onClick={handleCart}>
              <span>Cart</span>

              {count > 0 && <span className="cart-count static">{count}</span>}
            </button>

            {user ? (
              <button
                className="mobile-menu-item"
                onClick={() => go("/profile")}
              >
                Profile
              </button>
            ) : (
              <button className="mobile-menu-item" onClick={handleLogin}>
                Log in
              </button>
            )}

            <button className="mobile-menu-item" onClick={handleSupport}>
              Support
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
