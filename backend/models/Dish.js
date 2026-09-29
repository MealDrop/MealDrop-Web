const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category: { type: String, default: "Main" },
    isVeg: { type: Boolean, default: true },
    imageUrl: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Dish", dishSchema);
