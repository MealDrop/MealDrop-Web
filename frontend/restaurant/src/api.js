import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 8000,
});

export function setAuthToken(token) {
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete client.defaults.headers.common.Authorization;
}

export function isBackendUnreachable(err) {
  return !err.response;
}

const withId = (obj) => (obj ? { ...obj, id: obj._id || obj.id } : obj);

// ---- auth ----
export const requestOtp = (phone) =>
  client.post("/auth/request-otp", { phone }).then((r) => r.data);

export const verifyOtp = (phone, otp, name, role) =>
  client.post("/auth/verify-otp", { phone, otp, name, role }).then((r) => ({
    token: r.data.token,
    user: withId(r.data.user),
    restaurant: withId(r.data.restaurant),
  }));

export const getMe = () =>
  client
    .get("/auth/me")
    .then((r) => ({
      user: withId(r.data.user),
      restaurant: withId(r.data.restaurant),
    }));

export const updateProfile = (patch) =>
  client.put("/auth/profile", patch).then((r) => withId(r.data.user));

export const deleteMyAccount = () => client.delete("/auth/account");

// ---- restaurant ----
export const createRestaurant = (payload) =>
  client.post("/restaurants", payload).then((r) => withId(r.data));

export const updateRestaurant = (id, patch) =>
  client.put(`/restaurants/${id}`, patch).then((r) => withId(r.data));

export const getRestaurant = (id) =>
  client.get(`/restaurants/${id}`).then((r) => ({
    restaurant: withId(r.data.restaurant),
    dishes: r.data.dishes.map(withId),
  }));

// ---- dishes ----
export const getDishes = (restaurantId) =>
  client
    .get(`/dishes/restaurant/${restaurantId}`)
    .then((r) => r.data.map(withId));

export const createDish = (payload) =>
  client.post("/dishes", payload).then((r) => withId(r.data));

export const updateDish = (id, patch) =>
  client.put(`/dishes/${id}`, patch).then((r) => withId(r.data));

export const deleteDish = (id) => client.delete(`/dishes/${id}`);

// ---- orders ----
export const getRestaurantOrders = (restaurantId) =>
  client
    .get(`/orders/restaurant/${restaurantId}`)
    .then((r) => r.data.map(withId));

export const updateOrderStatus = (id, status) =>
  client.put(`/orders/${id}/status`, { status }).then((r) => withId(r.data));

export default client;
