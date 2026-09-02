import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Check,
  Clock3,
  PackageCheck,
  ChefHat,
  Bike,
  XCircle,
} from "lucide-react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/OrdersPage.css";

const POLL_INTERVAL = 5000;

const STATUS_LABELS = {
  placed: "New order",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  picked_up: "Picked up",
  on_the_way: "On the way",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

function formatDate(value) {
  if (!value) return "";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function nextAction(status) {
  const actions = {
    placed: {
      label: "Accept order",
      status: "accepted",
      icon: Check,
    },
    accepted: {
      label: "Start preparing",
      status: "preparing",
      icon: ChefHat,
    },
    preparing: {
      label: "Mark ready",
      status: "ready",
      icon: PackageCheck,
    },
    ready: {
      label: "Picked up",
      status: "picked_up",
      icon: PackageCheck,
    },
    picked_up: {
      label: "On the way",
      status: "on_the_way",
      icon: Bike,
    },
    on_the_way: {
      label: "Mark delivered",
      status: "delivered",
      icon: Check,
    },
  };

  return actions[status] || null;
}

export default function OrdersPage() {
  const { restaurant } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [updating, setUpdating] = useState(null);

  async function loadOrders(showLoader = false) {
    if (!restaurant) return;

    if (showLoader) setLoading(true);

    try {
      const data = await api.getRestaurantOrders(restaurant.id);
      setOrders(data);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  useEffect(() => {
    if (!restaurant) return;

    loadOrders(true);

    const interval = setInterval(() => {
      loadOrders(false);
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [restaurant?.id]);

  if (!restaurant) {
    return <Navigate to="/setup" replace />;
  }

  async function changeStatus(order, status) {
    if (updating) return;

    setUpdating(order.id);

    const previous = orders;

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );

    try {
      const updated = await api.updateOrderStatus(
        order.id,
        status,
      );

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? updated : item,
        ),
      );
    } catch (err) {
      setOrders(previous);

      window.alert(
        err.response?.data?.message ||
          "Could not update the order.",
      );
    } finally {
      setUpdating(null);
    }
  }

  async function rejectOrder(order) {
    if (updating) return;

    const reason = window.prompt(
      "Reason for rejecting this order?",
      "Restaurant is unable to prepare this order",
    );

    if (reason === null) return;

    setUpdating(order.id);

    try {
      const updated = await api.rejectOrder(
        order.id,
        reason,
      );

      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? updated : item,
        ),
      );
    } catch (err) {
      window.alert(
        err.response?.data?.message ||
          "Could not reject the order.",
      );
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="page orders-page">
      <div className="container orders-container">
        <div className="orders-header">
          <div>
            <p className="eyebrow">Restaurant operations</p>
            <h1>Orders</h1>
            <p className="muted">
              New customer orders and their current delivery progress.
            </p>
          </div>

          <div className="orders-live">
            <span className="live-dot" />
            Live
          </div>
        </div>

        {loadError && (
          <p className="banner banner-error">
            Couldn't refresh orders. The page will keep trying.
          </p>
        )}

        {loading ? (
          <div className="spinner" />
        ) : orders.length === 0 ? (
          <div className="card orders-empty">
            <Clock3 size={32} />
            <h2>No active orders</h2>
            <p>
              New orders from customers will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="order-manage-list">
            {orders.map((order) => {
              const action = nextAction(order.status);
              const ActionIcon = action?.icon;
              const busy = updating === order.id;

              return (
                <article
                  className={`order-manage-row card status-${order.status}`}
                  key={order.id}
                >
                  <div className="order-top">
                    <div>
                      <p className="order-id">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="muted">
                        {formatDate(
                          order.placedAt || order.createdAt,
                        )}
                      </p>
                    </div>

                    <span className="order-status-badge">
                      {STATUS_LABELS[order.status] ||
                        order.status}
                    </span>
                  </div>

                  <div className="order-main">
                    <div className="order-items">
                      {order.items?.map((item, index) => (
                        <div
                          className="order-item"
                          key={`${item.dish}-${index}`}
                        >
                          <span className="order-item-qty">
                            {item.qty}×
                          </span>

                          <span className="order-item-name">
                            {item.name}
                          </span>

                          <span className="order-item-price">
                            ₹{item.price * item.qty}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-total-box">
                      <span className="muted">Total</span>
                      <strong>₹{order.total}</strong>
                    </div>
                  </div>

                  <div className="order-customer">
                    <div>
                      <span className="customer-label">
                        Delivery address
                      </span>
                      <p>{order.address || "Address not provided"}</p>
                    </div>

                    <div>
                      <span className="customer-label">
                        Payment
                      </span>
                      <p>
                        {order.paymentMethod === "COD"
                          ? "Cash on delivery"
                          : order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {action && (
                    <div className="order-actions">
                      {order.status === "placed" && (
                        <button
                          className="btn btn-outline"
                          disabled={busy}
                          onClick={() => rejectOrder(order)}
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      )}

                      <button
                        className="btn btn-primary"
                        disabled={busy}
                        onClick={() =>
                          changeStatus(
                            order,
                            action.status,
                          )
                        }
                      >
                        {ActionIcon && (
                          <ActionIcon size={15} />
                        )}
                        {busy
                          ? "Updating..."
                          : action.label}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}