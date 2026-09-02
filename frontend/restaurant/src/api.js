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
  signupDetails = {},
  ownerRole = "owner",
  mode = "login",
) =>
  client
    .post("/auth/verify-otp", {
      email,
      otp: signupDetails.otp || "",
      name: signupDetails.name || "",
      phone: signupDetails.phone || "",
      address: signupDetails.address || "",
      role: ownerRole,
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

export const createRestaurant = (payload) =>
  client.post("/restaurants", payload).then((r) => withId(r.data));

export const updateRestaurant = (id, patch) =>
  client.put(`/restaurants/${id}`, patch).then((r) => withId(r.data));

export const getRestaurant = (id) =>
  client.get(`/restaurants/${id}`).then((r) => ({
    restaurant: withId(r.data.restaurant),
    dishes: r.data.dishes.map(withId),
  }));

export const getDishes = (restaurantId) =>
  client
    .get(`/dishes/restaurant/${restaurantId}`)
    .then((r) => r.data.map(withId));

export const createDish = (payload) =>
  client.post("/dishes", payload).then((r) => withId(r.data));

export const updateDish = (id, patch) =>
  client.put(`/dishes/${id}`, patch).then((r) => withId(r.data));

export const deleteDish = (id) => client.delete(`/dishes/${id}`);

export const uploadImage = (file) => {
  const formData = new FormData();

  formData.append("image", file);

  return client
    .post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((r) => r.data.url);
};

export const getRestaurantOrders = (restaurantId) =>
  client
    .get(`/orders/restaurant/${restaurantId}`)
    .then((r) => r.data.map(withId));

export const updateOrderStatus = (id, status, note = "") =>
  client
    .put(`/orders/${id}/status`, {
      status,
      note,
    })
    .then((r) => withId(r.data));

export const acceptOrder = (id) =>
  client.put(`/orders/${id}/accept`).then((r) => withId(r.data));

export const rejectOrder = (id, note = "") =>
  client.put(`/orders/${id}/reject`, { note }).then((r) => withId(r.data));

export const startPreparing = (id) =>
  client.put(`/orders/${id}/preparing`).then((r) => withId(r.data));

export const markReady = (id) =>
  client.put(`/orders/${id}/ready`).then((r) => withId(r.data));

export const pickUpOrder = (id) =>
  client.put(`/orders/${id}/picked-up`).then((r) => withId(r.data));

export const markOnTheWay = (id) =>
  client.put(`/orders/${id}/on-the-way`).then((r) => withId(r.data));

export const markDelivered = (id) =>
  client.put(`/orders/${id}/delivered`).then((r) => withId(r.data));

export default client;
