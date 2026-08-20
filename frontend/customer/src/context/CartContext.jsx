import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [items, setItems] = useState([]); // { id, name, price, qty }
  const [toasts, setToasts] = useState([]);

  function pushToast(message) {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      2600,
    );
  }

  function addItem(dish, fromRestaurantId, fromRestaurantName) {
    if (restaurantId && restaurantId !== fromRestaurantId) {
      const ok = window.confirm(
        `Your cart has items from ${restaurantName}. Start a new order from ${fromRestaurantName} instead?`,
      );
      if (!ok) return;
      setItems([]);
    }
    setRestaurantId(fromRestaurantId);
    setRestaurantName(fromRestaurantName);
    setItems((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing)
        return prev.map((i) =>
          i.id === dish.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [
        ...prev,
        { id: dish.id, name: dish.name, price: dish.price, qty: 1 },
      ];
    });
    pushToast(`Added ${dish.name} to cart`);
  }

  function changeQty(dishId, delta) {
    setItems((prev) =>
      prev
        .map((i) => (i.id === dishId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }

  function clearCart() {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName("");
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        restaurantId,
        restaurantName,
        items,
        addItem,
        changeQty,
        clearCart,
        subtotal,
        count,
        toasts,
        pushToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
