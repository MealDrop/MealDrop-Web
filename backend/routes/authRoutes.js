const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const {
  requestOtp,
  verifyOtp,
  getMe,
  updateProfile,
  deleteAccount,
} = require("../controllers/authController");

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);

router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.delete("/account", protect, deleteAccount);

module.exports = router;