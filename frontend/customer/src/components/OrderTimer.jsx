import { useEffect, useState } from "react";

function getRemainingTime(targetDate) {
  if (!targetDate) {
    return 0;
  }

  const target = new Date(targetDate).getTime();
  const now = Date.now();

  return Math.max(0, target - now);
}

function formatRemainingTime(milliseconds) {
  if (milliseconds <= 0) {
    return "Arriving soon";
  }

  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function OrderTimer({ estimatedDeliveryAt }) {
  const [remaining, setRemaining] = useState(() =>
    getRemainingTime(estimatedDeliveryAt),
  );

  useEffect(() => {
    setRemaining(getRemainingTime(estimatedDeliveryAt));

    if (!estimatedDeliveryAt) {
      return undefined;
    }

    const interval = setInterval(() => {
      setRemaining(getRemainingTime(estimatedDeliveryAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [estimatedDeliveryAt]);

  if (!estimatedDeliveryAt) {
    return null;
  }

  return (
    <div className="order-timer">
      <span className="order-timer-label">Estimated delivery</span>

      <strong>{formatRemainingTime(remaining)}</strong>
    </div>
  );
}
