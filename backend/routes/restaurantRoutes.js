const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
} = require("../controllers/restaurantController");

const router = express.Router();

router.get("/", listRestaurants);
router.get("/:id", getRestaurant);
router.post("/", protect, allowRoles("owner"), createRestaurant);
router.put("/:id", protect, allowRoles("owner"), updateRestaurant);

module.exports = router;
