import { useCart } from "../context/CartContext.jsx";
import "./styles/Toast.css";

export default function Toast() {
  const { toasts } = useCart();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.message}
        </div>
      ))}
    </div>
  );
}
