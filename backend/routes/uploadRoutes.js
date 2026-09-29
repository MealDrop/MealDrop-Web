const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("owner"),
  upload.single("image"),
  uploadImage,
);

module.exports = router;
