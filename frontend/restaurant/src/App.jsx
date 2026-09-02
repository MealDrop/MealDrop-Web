import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Header from "./components/Header.jsx";
import AuthModal from "./components/AuthModal.jsx";
import SupportModal from "./components/SupportModal.jsx";

import SetupPage from "./pages/SetupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import { useAuth } from "./context/AuthContext.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner" />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const { user, restaurant, loading } = useAuth();

  const [showLogin, setShowLogin] = useState(false);

  const [showSupport, setShowSupport] = useState(false);

  function openLogin() {
    setShowLogin(true);
  }

  function openSupport() {
    setShowSupport(true);
  }

  return (
    <>
      <Header onLoginClick={openLogin} onSupportClick={openSupport} />

      <Routes>
        <Route
          path="/"
          element={
            loading ? (
              <div className="spinner" />
            ) : !user ? (
              <Landing onLoginClick={openLogin} />
            ) : (
              <Navigate to={restaurant ? "/dashboard" : "/setup"} replace />
            )
          }
        />

        <Route
          path="/setup"
          element={
            <RequireAuth>
              <SetupPage />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />

        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrdersPage />
            </RequireAuth>
          }
        />

        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage
                onLoginClick={openLogin}
                onSupportClick={openSupport}
              />
            </RequireAuth>
          }
        />
      </Routes>

      {showLogin && <AuthModal onClose={() => setShowLogin(false)} />}

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </>
  );
}

function Landing({ onLoginClick }) {
  return (
    <div className="page">
      <div className="container landing">
        <p className="eyebrow">MealDrop for restaurants</p>

        <h1>Reach more customers in Barasat.</h1>

        <p
          className="muted"
          style={{
            maxWidth: 480,
            margin: "10px auto 26px",
          }}
        >
          List your menu, manage orders, and control your restaurant from one
          simple dashboard.
        </p>

        <button className="btn btn-primary" onClick={onLoginClick}>
          Get started
        </button>
      </div>
    </div>
  );
}
