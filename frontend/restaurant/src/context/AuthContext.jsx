import { createContext, useContext, useEffect, useState } from "react";
import * as api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);

  const [restaurant, setRestaurantState] = useState(null);

  const [token, setToken] = useState(() =>
    localStorage.getItem("mealdrop_owner_token"),
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
      .then((data) => {
        setUserState(data.user || null);

        setRestaurantState(data.restaurant || null);
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function login({
    token: newToken,
    user: newUser,
    restaurant: newRestaurant,
  }) {
    localStorage.setItem("mealdrop_owner_token", newToken);

    api.setAuthToken(newToken);

    setToken(newToken);
    setUserState(newUser || null);

    setRestaurantState(newRestaurant || null);
  }

  function logout() {
    localStorage.removeItem("mealdrop_owner_token");

    api.setAuthToken(null);

    setToken(null);
    setUserState(null);
    setRestaurantState(null);
  }

  function updateUser(patch) {
    setUserState((current) => ({
      ...(current || {}),
      ...patch,
    }));
  }

  function updateRestaurant(patch) {
    setRestaurantState((current) => ({
      ...(current || {}),
      ...patch,
    }));
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
