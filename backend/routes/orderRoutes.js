const express = require("express");

const {
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
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, allowRoles("customer"), createOrder);

router.get("/mine", protect, allowRoles("customer"), myOrders);

router.get("/mine/active", protect, allowRoles("customer"), activeOrders);

router.get("/mine/history", protect, allowRoles("customer"), orderHistory);

router.get("/:id", protect, allowRoles("customer"), getOrderById);

router.get(
  "/restaurant/:restaurantId",
  protect,
  allowRoles("owner"),
  restaurantOrders,
);

router.put("/:id/status", protect, allowRoles("owner"), updateStatus);

router.put("/:id/accept", protect, allowRoles("owner"), acceptOrder);

router.put("/:id/reject", protect, allowRoles("owner"), rejectOrder);

router.put("/:id/preparing", protect, allowRoles("owner"), startPreparing);

router.put("/:id/ready", protect, allowRoles("owner"), markReady);

router.put("/:id/picked-up", protect, allowRoles("owner"), pickUpOrder);

router.put("/:id/on-the-way", protect, allowRoles("owner"), markOnTheWay);

router.put("/:id/delivered", protect, allowRoles("owner"), markDelivered);

router.put("/:id/cancel", protect, allowRoles("customer"), cancelOrder);

module.exports = router;
