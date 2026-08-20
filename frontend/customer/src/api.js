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
  client.get("/auth/me").then((r) => ({
    user: withId(r.data.user),
    restaurant: withId(r.data.restaurant),
  }));

export const updateProfile = (patch) =>
  client.put("/auth/profile", patch).then((r) => withId(r.data.user));

export const deleteMyAccount = () => client.delete("/auth/account");

// ---- restaurants ----
export const getRestaurants = () =>
  client.get("/restaurants").then((r) => r.data.map(withId));

export const getRestaurant = (id) =>
  client.get(`/restaurants/${id}`).then((r) => ({
    restaurant: withId(r.data.restaurant),
    dishes: r.data.dishes.map(withId),
  }));

// ---- reviews ----
export const getReviews = (restaurantId) =>
  client
    .get(`/reviews/restaurant/${restaurantId}`)
    .then((r) => r.data.map(withId));

export const createReview = (restaurantId, rating, comment) =>
  client
    .post("/reviews", { restaurant: restaurantId, rating, comment })
    .then((r) => withId(r.data));

// ---- orders ----
export const placeOrder = (payload) =>
  client.post("/orders", payload).then((r) => withId(r.data));

export const getMyOrders = () =>
  client.get("/orders/mine").then((r) => r.data.map(withId));

export default client;
