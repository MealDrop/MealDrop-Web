const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  listByRestaurant,
  createDish,
  updateDish,
  deleteDish,
} = require("../controllers/dishController");

const router = express.Router();

router.get("/restaurant/:restaurantId", listByRestaurant);
router.post("/", protect, allowRoles("owner"), createDish);
router.put("/:id", protect, allowRoles("owner"), updateDish);
router.delete("/:id", protect, allowRoles("owner"), deleteDish);

module.exports = router;
