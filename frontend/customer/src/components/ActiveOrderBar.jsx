import { ArrowRight, Clock3, PackageCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrder } from "../context/OrderContext.jsx";
import "./styles/ActiveOrderBar.css";

function getStatusText(status) {
  switch (status) {
    case "placed":
      return "Waiting for restaurant";

    case "accepted":
      return "Restaurant accepted";

    case "preparing":
      return "Preparing your food";

    case "ready":
      return "Order ready";

    case "picked_up":
      return "Picked up";

    case "on_the_way":
    case "onway":
      return "On the way";

    default:
      return "Processing order";
  }
}

function getRemaining(estimatedDeliveryAt) {
  if (!estimatedDeliveryAt) {
    return null;
  }

  const difference = new Date(estimatedDeliveryAt).getTime() - Date.now();

  if (difference <= 0) {
    return "Arriving soon";
  }

  const minutes = Math.ceil(difference / 60000);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
}

export default function ActiveOrderBar() {
  const { activeOrder } = useOrder();

  const navigate = useNavigate();

  if (!activeOrder) {
    return null;
  }

  const orderId = activeOrder.id || activeOrder._id;

  const restaurantName = activeOrder.restaurantName || "Your restaurant";

  const remaining = getRemaining(activeOrder.estimatedDeliveryAt);

  return (
    <button
      type="button"
      className="active-order-bar"
      onClick={() => navigate(`/order/${orderId}`)}
    >
      <div className="active-order-icon">
        <PackageCheck size={20} />
      </div>

      <div className="active-order-content">
        <div className="active-order-top">
          <strong>{restaurantName}</strong>

          <span className="active-order-live">LIVE</span>
        </div>

        <div className="active-order-bottom">
          <span>{getStatusText(activeOrder.status)}</span>

          {remaining && (
            <>
              <span className="active-order-dot">·</span>

              <span className="active-order-time">
                <Clock3 size={12} />

                {remaining}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="active-order-arrow">
        <ArrowRight size={18} />
      </div>
    </button>
  );
}
