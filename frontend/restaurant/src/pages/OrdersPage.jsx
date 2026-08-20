import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import * as api from "../api.js";
import { demoOrders } from "../data/demoData.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/OrdersPage.css";

const STATUSES = ["placed", "preparing", "onway", "delivered", "cancelled"];

export default function OrdersPage() {
  const { restaurant } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!restaurant) return;
    api
      .getRestaurantOrders(restaurant.id)
      .then(setOrders)
      .catch((err) => {
        if (api.isBackendUnreachable(err)) {
          setOffline(true);
          setOrders(demoOrders);
        }
      })
      .finally(() => setLoading(false));
  }, [restaurant?.id]);

  if (!restaurant) return <Navigate to="/setup" replace />;

  async function changeStatus(orderId, status) {
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status } : o)));
    try {
      await api.updateOrderStatus(orderId, status);
    } catch (err) {
      // offline — keep the local change, nothing more to do
    }
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title" style={{ margin: "28px 0 20px" }}>
          Orders
        </h1>
        {offline && (
          <p className="banner">Backend not reachable — showing demo orders.</p>
        )}

        {loading ? (
          <div className="spinner" />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h2>No orders yet</h2>
            <p>New orders from customers will show up here.</p>
          </div>
        ) : (
          <div className="order-manage-list">
            {orders.map((o) => (
              <div className="order-manage-row card" key={o.id}>
                <div className="order-manage-info">
                  <h4>Order #{o.id.slice(-6)}</h4>
                  <p className="muted">
                    {o.items?.map((i) => `${i.name} × ${i.qty}`).join(", ")}
                  </p>
                  <p className="muted">{o.address}</p>
                </div>
                <div className="order-manage-right">
                  <p className="order-total">₹{o.total}</p>
                  <select
                    className="field-input status-select"
                    value={o.status}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
