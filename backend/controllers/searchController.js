const Restaurant = require("../models/Restaurant");
const Dish = require("../models/Dish");
const { smartSearch } = require("../utils/geminiSearch");

// POST /api/search  { query }
async function search(req, res) {
  const query = (req.body.query || "").trim();
  if (!query)
    return res.status(400).json({ message: "A search query is required" });

  const restaurants = await Restaurant.find({ area: "Barasat" });
  const dishes = await Dish.find({
    restaurant: { $in: restaurants.map((r) => r._id) },
  });

  const menu = restaurants.map((r) => ({
    id: String(r._id),
    name: r.name,
    cuisines: r.cuisines,
    priceForTwo: r.priceForTwo,
    isOpen: r.isOpen,
    dishes: dishes.filter((d) => String(d.restaurant) === String(r._id)),
  }));

  const result = await smartSearch(query, menu);
  res.json(result);
}

module.exports = { search };
