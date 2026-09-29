const Dish = require("../models/Dish");
const Restaurant = require("../models/Restaurant");

async function ownRestaurantOrFail(userId) {
  const restaurant = await Restaurant.findOne({ owner: userId });
  if (!restaurant) {
    const err = new Error("Create your restaurant profile first");
    err.statusCode = 400;
    throw err;
  }
  return restaurant;
}

async function listByRestaurant(req, res) {
  const dishes = await Dish.find({ restaurant: req.params.restaurantId });
  res.json(dishes);
}

async function createDish(req, res) {
  const restaurant = await ownRestaurantOrFail(req.user._id);
  const { name, description, price, category, isVeg, imageUrl, isAvailable } =
    req.body;
  if (!name || price === undefined) {
    return res
      .status(400)
      .json({ message: "Dish name and price are required" });
  }
  const dish = await Dish.create({
    restaurant: restaurant._id,
    name,
    description,
    price,
    category,
    isVeg,
    imageUrl,
    isAvailable,
  });
  res.status(201).json(dish);
}

async function updateDish(req, res) {
  const restaurant = await ownRestaurantOrFail(req.user._id);
  const dish = await Dish.findOne({
    _id: req.params.id,
    restaurant: restaurant._id,
  });
  if (!dish) return res.status(404).json({ message: "Dish not found" });

  const { name, description, price, category, isVeg, imageUrl, isAvailable } =
    req.body;
  if (name !== undefined) dish.name = name;
  if (description !== undefined) dish.description = description;
  if (price !== undefined) dish.price = price;
  if (category !== undefined) dish.category = category;
  if (isVeg !== undefined) dish.isVeg = isVeg;
  if (imageUrl !== undefined) dish.imageUrl = imageUrl;
  if (isAvailable !== undefined) dish.isAvailable = isAvailable;
  await dish.save();
  res.json(dish);
}

async function deleteDish(req, res) {
  const restaurant = await ownRestaurantOrFail(req.user._id);
  const dish = await Dish.findOneAndDelete({
    _id: req.params.id,
    restaurant: restaurant._id,
  });
  if (!dish) return res.status(404).json({ message: "Dish not found" });
  res.json({ message: "Dish removed" });
}

module.exports = { listByRestaurant, createDish, updateDish, deleteDish };
