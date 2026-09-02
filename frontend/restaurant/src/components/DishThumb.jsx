import { useState } from "react";

export default function DishThumb({ name, imageUrl }) {
  const [broken, setBroken] = useState(false);

  if (!imageUrl || broken) {
    return (
      <div className="dish-thumb-placeholder">
        {(name || "D")[0].toUpperCase()}
      </div>
    );
  }
  return (
    <img
      className="dish-thumb"
      src={imageUrl}
      alt={name}
      onError={() => setBroken(true)}
    />
  );
}
