require("dotenv").config({ quiet : true });
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`MealDrop API running on port ${PORT}`));
});
