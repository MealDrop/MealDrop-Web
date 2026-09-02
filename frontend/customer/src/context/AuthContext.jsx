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
    api.setAuthToken(token);
    api
      .getMe()
      .then(({ user }) => setUser(user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  function login({ token, user }) {
    localStorage.setItem("mealdrop_token", token);
    api.setAuthToken(token);
    setToken(token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("mealdrop_token");
    api.setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  function updateUser(patch) {
    setUser((u) => ({ ...u, ...patch }));
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
