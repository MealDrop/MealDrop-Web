import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import AuthModal from "./components/AuthModal.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import SupportModal from "./components/SupportModal.jsx";
import Toast from "./components/Toast.jsx";
import HomePage from "./pages/HomePage.jsx";
import RestaurantPage from "./pages/RestaurantPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const openLogin = () => setShowLogin(true);
  const openCart = () => setCartOpen(true);
  const openSupport = () => setShowSupport(true);

  return (
    <>
      <Header
        onCartClick={openCart}
        onLoginClick={openLogin}
        onSupportClick={openSupport}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/restaurant/:id"
          element={<RestaurantPage onCartClick={openCart} />}
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              onLoginClick={openLogin}
              onSupportClick={openSupport}
            />
          }
        />
      </Routes>

      {showLogin && <AuthModal onClose={() => setShowLogin(false)} />}
      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onLoginClick={openLogin}
      />
      <Toast />
    </>
  );
}
