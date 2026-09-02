import { useEffect, useState } from "react";
import {
  X,
  ShoppingBag,
  ChevronLeft,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as api from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useOrder } from "../context/OrderContext.jsx";
import "./styles/CartDrawer.css";

const DELIVERY_FEE = 30;
const FREE_DELIVERY_ABOVE = 199;

export default function CartDrawer({ open, onClose, onLoginClick }) {
  const {
    items,
    restaurantId,
    restaurantName,
    changeQty,
    subtotal,
    clearCart,
  } = useCart();

  const { user } = useAuth();
  const { setOrder } = useOrder();

  const navigate = useNavigate();

  const [step, setStep] = useState("cart");
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.address) {
      setAddress(user.address);
    }
  }, [user]);

  useEffect(() => {
    if (!open) {
      setError("");
      setPlacing(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;

  const total = items.length > 0 ? subtotal + deliveryFee : 0;

  function close() {
    if (placing) {
      return;
    }

    onClose();

    setTimeout(() => {
      setStep("cart");
      setError("");
    }, 250);
  }

  function goCheckout() {
    setError("");

    if (!user) {
      onClose();
      onLoginClick();
      return;
    }

    if (!items.length) {
      return;
    }

    setStep("checkout");
  }

  async function placeOrder() {
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!restaurantId) {
      setError(
        "Restaurant information is missing. Please add the items again.",
      );
      return;
    }

    if (!address.trim()) {
      setError("Add a delivery address first.");
      return;
    }

    setError("");
    setPlacing(true);

    const payload = {
      restaurant: restaurantId,
      restaurantName: restaurantName || "",

      items: items.map((item) => ({
        dish: item.id,
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty),
      })),

      subtotal: Number(subtotal),
      deliveryFee: Number(deliveryFee),
      total: Number(total),

      address: address.trim(),

      paymentMethod: "COD",
    };

    try {
      const createdOrder = await api.placeOrder(payload);

      const order = createdOrder?.order || createdOrder;

      const orderId = order?.id || order?._id;

      if (!orderId) {
        throw new Error("Order was created but no order ID was returned.");
      }

      const activeOrder = {
        ...order,
        id: orderId,
      };

      setOrder(activeOrder);

      clearCart();

      onClose();

      setStep("cart");
      setError("");
      setPlacing(false);

      navigate(`/order/${orderId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not place the order — check your connection and try again.",
      );

      setPlacing(false);
    }
  }

  return (
    <div className="drawer-overlay" onClick={close}>
      <div
        className="drawer-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          {step === "checkout" ? (
            <button
              type="button"
              className="btn-icon"
              onClick={() => {
                if (!placing) {
                  setError("");
                  setStep("cart");
                }
              }}
              disabled={placing}
              aria-label="Back to cart"
            >
              <ChevronLeft size={18} />
            </button>
          ) : (
            <div className="drawer-head-spacer" />
          )}

          <h3 className="drawer-title">
            {step === "checkout"
              ? "Checkout"
              : step === "done"
                ? "Order placed"
                : restaurantName || "Your cart"}
          </h3>

          <button
            type="button"
            className="btn-icon"
            onClick={close}
            disabled={placing}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {step === "cart" && (
          <>
            <div className="drawer-body">
              {items.length === 0 ? (
                <div className="drawer-empty">
                  <ShoppingBag size={30} />

                  <p>Your cart is empty — add a dish to get started.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="drawer-line">
                    <div className="drawer-line-info">
                      <p className="drawer-line-name">{item.name}</p>

                      <p className="muted">
                        ₹{item.price} × {item.qty}
                      </p>
                    </div>

                    <div className="stepper">
                      <button
                        type="button"
                        onClick={() => changeQty(item.id, -1)}
                        aria-label={`Decrease ${item.name}`}
                      >
                        −
                      </button>

                      <span>{item.qty}</span>

                      <button
                        type="button"
                        onClick={() => changeQty(item.id, 1)}
                        aria-label={`Increase ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="drawer-footer">
                <div className="summary-row">
                  <span>Subtotal</span>

                  <span>₹{subtotal}</span>
                </div>

                <div className="summary-row">
                  <span>Delivery fee</span>

                  <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                </div>

                {deliveryFee > 0 && (
                  <p className="muted delivery-hint">
                    Add ₹{FREE_DELIVERY_ABOVE - subtotal} more for free delivery
                  </p>
                )}

                <div className="summary-row summary-total">
                  <span>Total</span>

                  <span>₹{total}</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={goCheckout}
                >
                  Proceed to checkout
                </button>
              </div>
            )}
          </>
        )}

        {step === "checkout" && (
          <div className="drawer-body checkout-body">
            <div className="checkout-intro">
              <p className="eyebrow">Delivery details</p>

              <h4>Where should we deliver?</h4>

              <p className="muted">
                Your saved address is pre-filled. You can change it for this
                order.
              </p>
            </div>

            <label className="field-label" htmlFor="delivery-address">
              Delivery address
            </label>

            <textarea
              id="delivery-address"
              className="field-input"
              rows={4}
              placeholder="House no, street, area..."
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              disabled={placing}
            />

            <label className="field-label">Payment method</label>

            <div className="payment-method">
              <div className="payment-method-icon">₹</div>

              <div>
                <strong>Cash on delivery</strong>

                <span>Pay when your order arrives</span>
              </div>
            </div>

            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal</span>

                <span>₹{subtotal}</span>
              </div>

              <div className="summary-row">
                <span>Delivery fee</span>

                <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
              </div>

              <div className="summary-row summary-total">
                <span>Total</span>

                <span>₹{total}</span>
              </div>
            </div>

            {error && <p className="field-error">{error}</p>}

            <button
              type="button"
              className="btn btn-primary btn-block place-order-button"
              disabled={placing}
              onClick={placeOrder}
            >
              {placing ? (
                "Placing order..."
              ) : (
                <>
                  Place order · ₹{total}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="drawer-body drawer-empty order-placed-state">
            <CheckCircle2 size={52} className="order-success-icon" />

            <h3>Order placed!</h3>

            <p>Your order has been sent to the restaurant.</p>

            <button type="button" className="btn btn-primary" onClick={close}>
              Continue browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
