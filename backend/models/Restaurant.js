const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    regNo: { type: String, required: true, unique: true },
    area: { type: String, default: "Barasat" },
    address: { type: String, default: "" },
    closedUntil: { type: Date, default: null },
    location: {
      lat: { type: Number, default: 22.7237 },
      lng: { type: Number, default: 88.4844 },
    },
    cuisines: [{ type: String }],
    priceForTwo: { type: Number, default: 0 },
    openingTime: { type: String, default: "10:00" },
    closingTime: { type: String, default: "22:00" },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
