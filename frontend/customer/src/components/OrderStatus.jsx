const STEPS = [
  {
    key: "placed",
    label: "Order placed",
  },
  {
    key: "accepted",
    label: "Restaurant accepted",
  },
  {
    key: "preparing",
    label: "Preparing your food",
  },
  {
    key: "ready",
    label: "Ready for pickup",
  },
  {
    key: "picked_up",
    label: "Picked up",
  },
  {
    key: "on_the_way",
    label: "Out for delivery",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
];

const ORDER_INDEX = {
  placed: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
  picked_up: 4,
  on_the_way: 5,
  delivered: 6,
};

export default function OrderStatus({ status }) {
  const currentIndex = ORDER_INDEX[status] ?? 0;

  const rejected = status === "rejected";
  const cancelled = status === "cancelled";

  if (rejected || cancelled) {
    return (
      <div className="order-status-error">
        <div className="order-status-error-icon">×</div>

        <div>
          <strong>{rejected ? "Order rejected" : "Order cancelled"}</strong>

          <p>
            {rejected
              ? "The restaurant could not accept this order."
              : "This order has been cancelled."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      {STEPS.map((step, index) => {
        const completed = index < currentIndex;
        const current = index === currentIndex;

        return (
          <div
            className={`order-step ${
              completed ? "completed" : ""
            } ${current ? "current" : ""}`}
            key={step.key}
          >
            <div className="order-step-marker">
              {completed ? "✓" : current ? "●" : ""}
            </div>

            <div className="order-step-content">
              <strong>{step.label}</strong>

              {current && <span>In progress</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
