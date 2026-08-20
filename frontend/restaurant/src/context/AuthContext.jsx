import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("mealdrop_owner_token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (token === "demo-token") {
      const savedUser = localStorage.getItem("mealdrop_owner_demo_user");
      const savedRestaurant = localStorage.getItem(
        "mealdrop_owner_demo_restaurant",
      );
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedRestaurant) setRestaurant(JSON.parse(savedRestaurant));
      setLoading(false);
      return;
    }
    api.setAuthToken(token);
    api
      .getMe()
      .then((data) => {
        setUser(data.user);
        setRestaurant(data.restaurant);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function login({ token, user, restaurant }) {
    localStorage.setItem("mealdrop_owner_token", token);
    if (token === "demo-token")
      localStorage.setItem("mealdrop_owner_demo_user", JSON.stringify(user));
    else api.setAuthToken(token);
    setToken(token);
    setUser(user);
    setRestaurant(restaurant || null);
  }

  function logout() {
    localStorage.removeItem("mealdrop_owner_token");
    localStorage.removeItem("mealdrop_owner_demo_user");
    localStorage.removeItem("mealdrop_owner_demo_restaurant");
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
    setRestaurant(null);
  }

  function updateUser(patch) {
    const next = { ...user, ...patch };
    setUser(next);
    if (token === "demo-token")
      localStorage.setItem("mealdrop_owner_demo_user", JSON.stringify(next));
  }

  function updateRestaurant(patch) {
    const next = { ...restaurant, ...patch };
    setRestaurant(next);
    if (token === "demo-token")
      localStorage.setItem(
        "mealdrop_owner_demo_restaurant",
        JSON.stringify(next),
      );
    return next;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        restaurant,
        setRestaurant: updateRestaurant,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
