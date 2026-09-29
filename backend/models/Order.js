const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    restaurantName: {
      type: String,
      default: "",
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    paymentMethod: {
      type: String,
      default: "COD",
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready",
        "picked_up",
        "on_the_way",
        "delivered",
        "rejected",
        "cancelled",
      ],
      default: "placed",
    },

    estimatedPreparationMinutes: {
      type: Number,
      default: 20,
      min: 1,
    },

    estimatedDeliveryAt: {
      type: Date,
      default: null,
    },

    placedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    preparingAt: {
      type: Date,
      default: null,
    },

    readyAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    onTheWayAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },

    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Order", orderSchema);