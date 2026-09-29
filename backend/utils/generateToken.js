const jwt = require("jsonwebtoken");

function generateToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

module.exports = generateToken;
