const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Dish = require("../models/Dish");

const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "picked_up",
  "on_the_way",
];

const HISTORY_STATUSES = [
  "delivered",
  "cancelled",
  "rejected",
];

const ALLOWED_TRANSITIONS = {
  placed: ["accepted", "rejected", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["picked_up", "cancelled"],
  picked_up: ["on_the_way"],
  on_the_way: ["delivered"],
  delivered: [],
  rejected: [],
  cancelled: [],
};

const STATUS_TIMES = {
  accepted: "acceptedAt",
  preparing: "preparingAt",
  ready: "readyAt",
  picked_up: "pickedUpAt",
  on_the_way: "onTheWayAt",
  delivered: "deliveredAt",
  rejected: "rejectedAt",
  cancelled: "cancelledAt",
};

const DELIVERY_FEE = 30;
const FREE_DELIVERY_ABOVE = 199;

function calculateEstimatedDeliveryAt(preparationMinutes) {
  const preparation = Number(preparationMinutes) || 20;
  const deliveryBuffer = 15;

  return new Date(
    Date.now() +
      (preparation + deliveryBuffer) * 60 * 1000,
  );
}

function addStatusHistory(order, status, note = "") {
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note,
  });
}

function setStatusTimestamp(order, status) {
  const field = STATUS_TIMES[status];

  if (field) {
    order[field] = new Date();
  }
}

async function getOwnedRestaurant(userId, restaurantId) {
  return Restaurant.findOne({
    _id: restaurantId,
    owner: userId,
  });
}

async function createOrder(req, res) {
  try {
    const {
      restaurant,
      items,
      address,
      paymentMethod,
      estimatedPreparationMinutes,
    } = req.body;

    if (!restaurant || !Array.isArray(items) || !items.length) {
      return res.status(400).json({
        message: "Restaurant and items are required",
      });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({
        message: "Delivery address is required",
      });
    }

    const restaurantDoc = await Restaurant.findById(
      restaurant,
    );

    if (!restaurantDoc) {
      return res.status(404).json({
        message: "Restaurant not found",
      });
    }

    if (!restaurantDoc.isOpen) {
      return res.status(400).json({
        message: "This restaurant is currently closed",
      });
    }

    const dishIds = items.map((item) => item.dish);

    const dishes = await Dish.find({
      _id: { $in: dishIds },
      restaurant: restaurantDoc._id,
      isAvailable: true,
    });

    if (dishes.length !== items.length) {
      return res.status(400).json({
        message:
          "One or more selected dishes are unavailable",
      });
    }

    const dishMap = new Map(
      dishes.map((dish) => [
        dish._id.toString(),
        dish,
      ]),
    );

    const normalizedItems = [];

    for (const item of items) {
      const qty = Number(item.qty);

      if (!Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({
          message: "Invalid item quantity",
        });
      }

      const dish = dishMap.get(
        String(item.dish),
      );

      if (!dish) {
        return res.status(400).json({
          message: "Invalid dish selected",
        });
      }

      normalizedItems.push({
        dish: dish._id,
        name: dish.name,
        price: dish.price,
        qty,
      });
    }

    const subtotal = normalizedItems.reduce(
      (sum, item) =>
        sum + item.price * item.qty,
      0,
    );

    const deliveryFee =
      subtotal >= FREE_DELIVERY_ABOVE
        ? 0
        : DELIVERY_FEE;

    const total = subtotal + deliveryFee;

    const preparationMinutes =
      Number(estimatedPreparationMinutes) || 20;

    const estimatedDeliveryAt =
      calculateEstimatedDeliveryAt(
        preparationMinutes,
      );

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantDoc._id,
      restaurantName: restaurantDoc.name,
      items: normalizedItems,
      subtotal,
      deliveryFee,
      total,
      address: address.trim(),
      paymentMethod:
        paymentMethod || "COD",
      paymentStatus: "pending",
      status: "placed",
      estimatedPreparationMinutes:
        preparationMinutes,
      estimatedDeliveryAt,
      placedAt: new Date(),
      statusHistory: [
        {
          status: "placed",
          timestamp: new Date(),
          note: "Order placed by customer",
        },
      ],
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);

    return res.status(500).json({
      message: "Could not create order",
    });
  }
}

async function myOrders(req, res) {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);

    return res.status(500).json({
      message: "Could not load orders",
    });
  }
}

async function activeOrders(req, res) {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: {
        $in: ACTIVE_STATUSES,
      },
    }).sort({
      createdAt: -1,
    });

    return res.json(orders);
  } catch (error) {
    console.error(
      "Get active orders error:",
      error,
    );

    return res.status(500).json({
      message: "Could not load active orders",
    });
  }
}

async function orderHistory(req, res) {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: {
        $in: HISTORY_STATUSES,
      },
    }).sort({
      createdAt: -1,
    });

    return res.json(orders);
  } catch (error) {
    console.error(
      "Get order history error:",
      error,
    );

    return res.status(500).json({
      message: "Could not load order history",
    });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await Order.findById(
      req.params.id,
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (
      order.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to view this order",
      });
    }

    return res.json(order);
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      message: "Could not load order",
    });
  }
}

async function restaurantOrders(req, res) {
  try {
    const restaurant =
      await getOwnedRestaurant(
        req.user._id,
        req.params.restaurantId,
      );

    if (!restaurant) {
      return res.status(403).json({
        message: "You are not allowed to access this restaurant",
      });
    }

    const orders = await Order.find({
      restaurant: restaurant._id,
      status: {
        $in: ACTIVE_STATUSES,
      },
    }).sort({
      createdAt: -1,
    });

    return res.json(orders);
  } catch (error) {
    console.error(
      "Get restaurant orders error:",
      error,
    );

    return res.status(500).json({
      message: "Could not load restaurant orders",
    });
  }
}

async function updateStatus(req, res) {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const order = await Order.findById(
      req.params.id,
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (req.user.role === "owner") {
      const restaurant =
        await getOwnedRestaurant(
          req.user._id,
          order.restaurant,
        );

      if (!restaurant) {
        return res.status(403).json({
          message:
            "You are not allowed to modify this order",
        });
      }
    }

    if (req.user.role === "customer") {
      if (
        order.user.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not allowed to modify this order",
        });
      }
    }

    const allowedNextStatuses =
      ALLOWED_TRANSITIONS[order.status] || [];

    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        message: `Cannot change order from ${order.status} to ${status}`,
      });
    }

    order.status = status;

    setStatusTimestamp(
      order,
      status,
    );

    if (status === "cancelled") {
      order.cancellationReason =
        note || "Order cancelled";
    }

    if (status === "rejected") {
      order.rejectionReason =
        note ||
        "Restaurant rejected the order";
    }

    addStatusHistory(
      order,
      status,
      note || "",
    );

    await order.save();

    return res.json(order);
  } catch (error) {
    console.error(
      "Update order status error:",
      error,
    );

    return res.status(500).json({
      message: "Could not update order status",
    });
  }
}

async function acceptOrder(req, res) {
  req.body.status = "accepted";
  return updateStatus(req, res);
}

async function rejectOrder(req, res) {
  req.body.status = "rejected";
  return updateStatus(req, res);
}

async function startPreparing(req, res) {
  req.body.status = "preparing";
  return updateStatus(req, res);
}

async function markReady(req, res) {
  req.body.status = "ready";
  return updateStatus(req, res);
}

async function pickUpOrder(req, res) {
  req.body.status = "picked_up";
  return updateStatus(req, res);
}

async function markOnTheWay(req, res) {
  req.body.status = "on_the_way";
  return updateStatus(req, res);
}

async function markDelivered(req, res) {
  req.body.status = "delivered";
  return updateStatus(req, res);
}

async function cancelOrder(req, res) {
  req.body.status = "cancelled";
  return updateStatus(req, res);
}

module.exports = {
  createOrder,
  myOrders,
  activeOrders,
  orderHistory,
  getOrderById,
  restaurantOrders,
  updateStatus,
  acceptOrder,
  rejectOrder,
  startPreparing,
  markReady,
  pickUpOrder,
  markOnTheWay,
  markDelivered,
  cancelOrder,
};