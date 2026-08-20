export const demoDishes = [
  {
    id: "d1",
    name: "Butter Chicken",
    price: 260,
    category: "Main",
    isVeg: false,
    description: "Creamy tomato gravy, tender chicken.",
    imageUrl: "",
    isAvailable: true,
  },
  {
    id: "d2",
    name: "Paneer Tikka",
    price: 220,
    category: "Starter",
    isVeg: true,
    description: "Char-grilled cottage cheese cubes.",
    imageUrl: "",
    isAvailable: true,
  },
  {
    id: "d3",
    name: "Garlic Naan",
    price: 50,
    category: "Bread",
    isVeg: true,
    description: "Tandoor baked, brushed with garlic butter.",
    imageUrl: "",
    isAvailable: true,
  },
];

export const demoOrders = [
  {
    id: "o1",
    restaurantName: "Your Restaurant",
    items: [{ name: "Butter Chicken", qty: 2, price: 260 }],
    total: 550,
    address: "12 Station Road, Barasat",
    status: "placed",
    createdAt: new Date().toISOString(),
  },
];
