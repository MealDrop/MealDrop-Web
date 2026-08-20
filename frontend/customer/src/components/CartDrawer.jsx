import { useState } from "react";
import { X, ShoppingBag, ChevronLeft } from "lucide-react";
import * as api from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
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
  const [step, setStep] = useState("cart"); // cart | checkout | done
  const [address, setAddress] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = items.length ? subtotal + deliveryFee : 0;

  function close() {
    onClose();
    setTimeout(() => setStep("cart"), 250);
  }

  function goCheckout() {
    if (!user) return onLoginClick();
    setStep("checkout");
  }

  async function placeOrder() {
    if (!address.trim()) return setError("Add a delivery address first.");
    setError("");
    setPlacing(true);
    const payload = {
      restaurant: restaurantId,
      restaurantName,
      items: items.map((i) => ({
        dish: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      subtotal,
      deliveryFee,
      total,
      address,
      paymentMethod: "COD",
    };
    try {
      await api.placeOrder(payload);
      clearCart();
      setStep("done");
    } catch (err) {
      if (api.isBackendUnreachable(err)) {
        clearCart();
        setStep("done");
      } else {
        setError(err.response?.data?.message || "Could not place the order.");
      }
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="drawer-overlay" onClick={close}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          {step === "checkout" && (
            <button className="btn-icon" onClick={() => setStep("cart")}>
              <ChevronLeft size={18} />
            </button>
          )}
          <h3 className="drawer-title">
            {step === "checkout"
              ? "Checkout"
              : step === "done"
                ? "Order placed"
                : restaurantName || "Your cart"}
          </h3>
          <button className="btn-icon" onClick={close}>
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
                items.map((i) => (
                  <div key={i.id} className="drawer-line">
                    <div>
                      <p className="drawer-line-name">{i.name}</p>
                      <p className="muted">
                        ₹{i.price} × {i.qty}
                      </p>
                    </div>
                    <div className="stepper">
                      <button onClick={() => changeQty(i.id, -1)}>−</button>
                      <span>{i.qty}</span>
                      <button onClick={() => changeQty(i.id, 1)}>+</button>
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
          <div className="drawer-body">
            <label className="field-label">Delivery address</label>
            <textarea
              className="field-input"
              rows={3}
              placeholder="House no, street, area..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <label className="field-label">Payment method</label>
            <div className="chip">Cash on delivery</div>
            <div
              className="summary-row summary-total"
              style={{ marginTop: 18 }}
            >
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            {error && <p className="field-error">{error}</p>}
            <button
              className="btn btn-primary btn-block"
              disabled={placing}
              onClick={placeOrder}
              style={{ marginTop: 16 }}
            >
              {placing ? "Placing order..." : `Place order · ₹${total}`}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="drawer-body drawer-empty">
            <p style={{ fontSize: 40 }}>🎉</p>
            <p>Order placed! Your food is on its way.</p>
            <button className="btn btn-primary" onClick={close}>
              Continue browsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
