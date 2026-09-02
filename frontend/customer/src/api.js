import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 8000,
});

export function setAuthToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

const withId = (obj) => (obj ? { ...obj, id: obj._id || obj.id } : obj);

export const requestOtp = (email, mode = "login") =>
  client
    .post("/auth/request-otp", {
      email,
      mode,
    })
    .then((r) => r.data);

export const verifyOtp = (
  email,
  otp,
  name,
  role,
  phone,
  address,
  mode = "login",
) =>
  client
    .post("/auth/verify-otp", {
      email,
      otp,
      name,
      role,
      phone,
      address,
      mode,
    })
    .then((r) => ({
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

export const getRestaurants = () =>
  client.get("/restaurants").then((r) => r.data.map(withId));

export const getRestaurant = (id) =>
  client.get(`/restaurants/${id}`).then((r) => ({
    restaurant: withId(r.data.restaurant),
    dishes: r.data.dishes.map(withId),
  }));

export const getReviews = (restaurantId) =>
  client
    .get(`/reviews/restaurant/${restaurantId}`)
    .then((r) => r.data.map(withId));

export const createReview = (restaurantId, rating, comment) =>
  client
    .post("/reviews", {
      restaurant: restaurantId,
      rating,
      comment,
    })
    .then((r) => withId(r.data));

export const placeOrder = (payload) =>
  client.post("/orders", payload).then((r) => withId(r.data));

export const getMyOrders = () =>
  client.get("/orders/mine").then((r) => r.data.map(withId));

export const getActiveOrders = () =>
  client.get("/orders/mine/active").then((r) => r.data.map(withId));

export const getOrderHistory = () =>
  client.get("/orders/mine/history").then((r) => r.data.map(withId));

export const getOrder = (orderId) =>
  client.get(`/orders/${orderId}`).then((r) => withId(r.data));

export const cancelOrder = (orderId, reason = "Cancelled by customer") =>
  client
    .put(`/orders/${orderId}/cancel`, {
      note: reason,
    })
    .then((r) => withId(r.data));

export const smartSearch = (query) =>
  client.post("/search", { query }).then((r) => r.data);

export default client;
