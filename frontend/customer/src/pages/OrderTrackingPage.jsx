import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MapPin, RefreshCw, ShoppingBag } from "lucide-react";
import * as api from "../api.js";
import OrderStatus from "../components/OrderStatus.jsx";
import OrderTimer from "../components/OrderTimer.jsx";
import "./styles/OrderTrackingPage.css";

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "on_the_way",
];

export default function OrderTrackingPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const loadOrder = useCallback(
    async (showLoading = false) => {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const data = await api.getOrder(id);
        setOrder(data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this order.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadOrder(true);
  }, [loadOrder]);

  useEffect(() => {
    if (!order) return;

    if (!ACTIVE_STATUSES.includes(order.status)) {
      return;
    }

    const interval = setInterval(() => {
      loadOrder(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [order, loadOrder]);

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    setCancelling(true);

    try {
      const updated = await api.cancelOrder(id);
      setOrder(updated);
    } catch (err) {
      setError(err.response?.data?.message || "Could not cancel the order.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="order-page-state">
        <div className="spinner" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="order-page-state">
        <div className="order-error-card card">
          <h2>Couldn't load order</h2>
          <p>{error}</p>

          <button className="btn btn-primary" onClick={() => loadOrder(true)}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-page-state">
        <div className="order-error-card card">
          <h2>Order not found</h2>
          <Link to="/" className="btn btn-primary">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  const active = ACTIVE_STATUSES.includes(order.status);

  const canCancel = order.status === "placed" || order.status === "accepted";

  return (
    <div className="page order-tracking-page">
      <main className="order-container">
        <div className="order-topbar">
          <Link to="/" className="order-back-link">
            ← Continue browsing
          </Link>

          <button
            type="button"
            className="order-refresh"
            onClick={() => loadOrder(false)}
            disabled={refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "order-refresh-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {error && <div className="order-inline-error">{error}</div>}

        <section className="order-hero card">
          <div className="order-hero-main">
            <p className="eyebrow">Order #{order.id.slice(-8).toUpperCase()}</p>

            <h1>{order.restaurantName || "Your restaurant"}</h1>

            <p className="muted">
              {order.items?.length || 0} item
              {(order.items?.length || 0) !== 1 ? "s" : ""} · ₹{order.total}
            </p>
          </div>

          {active && order.estimatedDeliveryAt && (
            <OrderTimer estimatedDeliveryAt={order.estimatedDeliveryAt} />
          )}

          {order.status === "delivered" && (
            <div className="order-complete-badge">
              <CheckCircle2 size={18} />
              Delivered
            </div>
          )}
        </section>

        <section className="order-layout">
          <div className="order-main-column">
            <section className="tracking-card card">
              <div className="tracking-heading">
                <div>
                  <p className="eyebrow">Live order status</p>

                  <h2>
                    {order.status === "placed" && "Waiting for restaurant"}

                    {order.status === "accepted" &&
                      "Restaurant accepted your order"}

                    {order.status === "preparing" &&
                      "Your food is being prepared"}

                    {order.status === "ready" && "Your order is ready"}

                    {order.status === "picked_up" &&
                      "Your order has been picked up"}

                    {order.status === "on_the_way" &&
                      "Your order is on the way"}

                    {order.status === "delivered" && "Order delivered"}

                    {order.status === "rejected" && "Order rejected"}

                    {order.status === "cancelled" && "Order cancelled"}
                  </h2>
                </div>

                {active && (
                  <span className="live-pill">
                    <span />
                    Live
                  </span>
                )}
              </div>

              <OrderStatus status={order.status} />
            </section>

            <section className="order-items-card card">
              <div className="order-section-heading">
                <ShoppingBag size={17} />
                <h2>Order details</h2>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div
                    className="order-item"
                    key={`${item.dish || item.id}-${index}`}
                  >
                    <div className="order-item-qty">{item.qty}×</div>

                    <div className="order-item-info">
                      <strong>{item.name}</strong>
                    </div>

                    <div className="order-item-price">
                      ₹{item.price * item.qty}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-total-box">
                <span>Subtotal</span>
                <strong>₹{order.subtotal}</strong>
              </div>

              <div className="order-total-line">
                <span>Delivery fee</span>
                <span>₹{order.deliveryFee || 0}</span>
              </div>

              <div className="order-total-line order-grand-total">
                <strong>Total</strong>
                <strong>₹{order.total}</strong>
              </div>
            </section>
          </div>

          <aside className="order-side-column">
            <section className="order-info-card card">
              <div className="order-section-heading">
                <MapPin size={17} />
                <h2>Delivery address</h2>
              </div>

              <p>{order.address || "Delivery address not provided"}</p>
            </section>

            <section className="order-info-card card">
              <div className="order-section-heading">
                <ShoppingBag size={17} />
                <h2>Payment</h2>
              </div>

              <div className="payment-row">
                <span>Method</span>
                <strong>{order.paymentMethod || "COD"}</strong>
              </div>

              <div className="payment-row">
                <span>Status</span>
                <strong>{order.paymentStatus || "pending"}</strong>
              </div>
            </section>

            {canCancel && (
              <button
                type="button"
                className="order-cancel-button"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel order"}
              </button>
            )}
          </aside>
        </section>

        {order.status === "delivered" && (
          <section className="order-success-card">
            <CheckCircle2 size={20} />

            <div>
              <strong>Enjoyed your meal?</strong>

              <p>
                You can leave a review for the restaurant from your order
                history.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
