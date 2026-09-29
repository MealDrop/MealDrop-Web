const Review = require("../models/Review");

// GET /api/reviews/restaurant/:restaurantId
async function listByRestaurant(req, res) {
  const reviews = await Review.find({ restaurant: req.params.restaurantId })
    .populate("user", "name")
    .sort({ createdAt: -1 });
  res.json(reviews);
}

// POST /api/reviews
async function createReview(req, res) {
  const { restaurant, rating, comment } = req.body;
  if (!restaurant || !rating) {
    return res
      .status(400)
      .json({ message: "Restaurant and rating are required" });
  }
  const review = await Review.create({
    user: req.user._id,
    restaurant,
    rating,
    comment,
  });
  res.status(201).json(review);
}

module.exports = { listByRestaurant, createReview };
