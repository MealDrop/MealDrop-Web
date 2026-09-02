import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as api from "../api.js";

const OrderContext = createContext(null);

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "on_the_way",
  "onway",
];

function getStoredOrderId() {
  try {
    return localStorage.getItem("mealdrop_active_order");
  } catch {
    return null;
  }
}

function storeOrderId(id) {
  try {
    if (id) {
      localStorage.setItem("mealdrop_active_order", id);
    } else {
      localStorage.removeItem("mealdrop_active_order");
    }
  } catch {}
}

export function OrderProvider({ children }) {
  const [activeOrder, setActiveOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async (orderId) => {
    if (!orderId) {
      setActiveOrder(null);
      return null;
    }

    try {
      const order = await api.getOrder(orderId);

      if (ACTIVE_STATUSES.includes(order.status)) {
        setActiveOrder(order);
        storeOrderId(order.id || order._id);

        return order;
      }

      setActiveOrder(null);
      storeOrderId(null);

      return order;
    } catch {
      setActiveOrder(null);
      storeOrderId(null);
      return null;
    }
  }, []);

  const setOrder = useCallback((order) => {
    if (!order) {
      setActiveOrder(null);
      storeOrderId(null);
      return;
    }

    const id = order.id || order._id;

    setActiveOrder(order);

    if (id) {
      storeOrderId(id);
    }
  }, []);

  const refreshActiveOrder = useCallback(async () => {
    const id = activeOrder?.id || activeOrder?._id || getStoredOrderId();

    if (!id) {
      return null;
    }

    return loadOrder(id);
  }, [activeOrder, loadOrder]);

  useEffect(() => {
    const id = getStoredOrderId();

    if (!id) {
      setLoading(false);
      return;
    }

    loadOrder(id).finally(() => setLoading(false));
  }, [loadOrder]);

  useEffect(() => {
    if (!activeOrder) {
      return undefined;
    }

    if (!ACTIVE_STATUSES.includes(activeOrder.status)) {
      setActiveOrder(null);
      storeOrderId(null);
      return undefined;
    }

    const interval = setInterval(() => {
      refreshActiveOrder();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeOrder, refreshActiveOrder]);

  const clearActiveOrder = useCallback(() => {
    setActiveOrder(null);
    storeOrderId(null);
  }, []);

  const value = {
    activeOrder,
    loading,
    setOrder,
    refreshActiveOrder,
    clearActiveOrder,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrder must be used inside OrderProvider");
  }

  return context;
}
