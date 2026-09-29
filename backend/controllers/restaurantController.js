const Restaurant = require("../models/Restaurant");
const Dish = require("../models/Dish");
const generateRegNo = require("../utils/generateRegNo");

// GET /api/restaurants
async function listRestaurants(req, res) {
  const restaurants = await Restaurant.find({ area: "Barasat" }).sort({
    createdAt: -1,
  });
  res.json(restaurants);
}

// GET /api/restaurants/:id
async function getRestaurant(req, res) {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });
  const dishes = await Dish.find({
    restaurant: restaurant._id,
    isAvailable: true,
  });
  res.json({ restaurant, dishes });
}

// POST /api/restaurants
async function createRestaurant(req, res) {
  const existing = await Restaurant.findOne({ owner: req.user._id });
  if (existing)
    return res.status(400).json({ message: "You already have a restaurant" });

  const { name, cuisines, priceForTwo, openingTime, closingTime, address } =
    req.body;
  if (!name)
    return res.status(400).json({ message: "Restaurant name is required" });

  let regNo = generateRegNo();
  while (await Restaurant.findOne({ regNo })) regNo = generateRegNo(); // extremely unlikely, but stay safe

  const restaurant = await Restaurant.create({
    name,
    owner: req.user._id,
    regNo,
    cuisines: cuisines || [],
    priceForTwo: priceForTwo || 0,
    openingTime: openingTime || "10:00",
    closingTime: closingTime || "22:00",
    address: address || "",
  });

  res.status(201).json(restaurant);
}

// PUT /api/restaurants/:id
async function updateRestaurant(req, res) {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant)
    return res.status(404).json({ message: "Restaurant not found" });
  if (String(restaurant.owner) !== String(req.user._id)) {
    return res.status(403).json({ message: "Not your restaurant" });
  }

  const {
    name,
    cuisines,
    priceForTwo,
    openingTime,
    closingTime,
    isOpen,
    address,
    closedUntil,
  } = req.body;
  if (name !== undefined) restaurant.name = name;
  if (cuisines !== undefined) restaurant.cuisines = cuisines;
  if (priceForTwo !== undefined) restaurant.priceForTwo = priceForTwo;
  if (openingTime !== undefined) restaurant.openingTime = openingTime;
  if (closingTime !== undefined) restaurant.closingTime = closingTime;
  if (isOpen !== undefined) restaurant.isOpen = isOpen;
  if (address !== undefined) restaurant.address = address;
  if (closedUntil !== undefined) restaurant.closedUntil = closedUntil;
  await restaurant.save();

  res.json(restaurant);
}

module.exports = {
  listRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
};
