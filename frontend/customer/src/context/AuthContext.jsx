import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() =>
    localStorage.getItem("mealdrop_token"),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (token === "demo-token") {
      const saved = localStorage.getItem("mealdrop_demo_user");
      if (saved) setUser(JSON.parse(saved));
      setLoading(false);
      return;
    }
    api.setAuthToken(token);
    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function login({ token, user }) {
    localStorage.setItem("mealdrop_token", token);
    if (token === "demo-token")
      localStorage.setItem("mealdrop_demo_user", JSON.stringify(user));
    else api.setAuthToken(token);
    setToken(token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("mealdrop_token");
    localStorage.removeItem("mealdrop_demo_user");
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  function updateUser(patch) {
    const next = { ...user, ...patch };
    setUser(next);
    if (token === "demo-token")
      localStorage.setItem("mealdrop_demo_user", JSON.stringify(next));
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser: updateUser, token, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
