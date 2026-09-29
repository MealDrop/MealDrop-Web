const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  listByRestaurant,
  createReview,
} = require("../controllers/reviewController");

const router = express.Router();

router.get("/restaurant/:restaurantId", listByRestaurant);
router.post("/", protect, allowRoles("customer"), createReview);

module.exports = router;
