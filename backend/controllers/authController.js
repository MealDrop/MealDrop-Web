const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Dish = require("../models/Dish");
const generateToken = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const { sendOtpEmail } = require("../utils/sendEmail");

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const otpStore = new Map();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
}

function cleanEmail(email) {
  return (email || "").trim().toLowerCase();
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function requestOtp(req, res) {
  const email = cleanEmail(req.body.email);
  const mode = req.body.mode === "signup" ? "signup" : "login";

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Enter a valid email address",
    });
  }

  const existingUser = await User.findOne({ email });
  const exists = !!existingUser;

  if (mode === "login" && !exists) {
    return res.status(404).json({
      message: "No account exists with this email. Please sign up first.",
      exists: false,
    });
  }

  if (mode === "signup" && exists) {
    return res.status(409).json({
      message:
        "An account with this email already exists. Please log in instead.",
      exists: true,
    });
  }

  const code = generateOtp();

  otpStore.set(email, {
    code,
    mode,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  try {
    await sendOtpEmail(email, code);

    return res.json({
      message: "OTP sent — check your inbox",
      exists,
    });
  } catch (err) {
    otpStore.delete(email);

    console.error("sendOtpEmail failed:", err.message);

    return res.status(502).json({
      message:
        "Could not send the OTP email right now — check the SMTP settings and try again.",
    });
  }
}

async function verifyOtp(req, res) {
  const email = cleanEmail(req.body.email);
  const otp = cleanText(req.body.otp);

  const mode = req.body.mode === "signup" ? "signup" : "login";

  const role = req.body.role === "owner" ? "owner" : "customer";

  const name = cleanText(req.body.name);
  const phone = cleanText(req.body.phone);
  const address = cleanText(req.body.address);

  if (!isValidEmail(email) || !otp) {
    return res.status(400).json({
      message: "Email and OTP are required",
    });
  }

  const entry = otpStore.get(email);

  if (!entry) {
    return res.status(400).json({
      message: "Request a new OTP — this one has expired or was never sent.",
    });
  }

  if (entry.mode !== mode) {
    return res.status(400).json({
      message:
        "This OTP belongs to a different authentication request. Please request a new OTP.",
    });
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(email);

    return res.status(400).json({
      message: "This OTP has expired — request a new one.",
    });
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email);

    return res.status(400).json({
      message: "Too many incorrect attempts — request a new OTP.",
    });
  }

  if (otp !== entry.code) {
    entry.attempts += 1;

    return res.status(400).json({
      message: "Incorrect OTP",
    });
  }

  const existingUser = await User.findOne({ email });

  if (mode === "login") {
    if (!existingUser) {
      otpStore.delete(email);

      return res.status(404).json({
        message: "No account exists with this email. Please sign up first.",
      });
    }

    if (existingUser.role !== role) {
      otpStore.delete(email);

      return res.status(403).json({
        message: "This account cannot be accessed with this login type.",
      });
    }

    otpStore.delete(email);

    const token = generateToken(existingUser._id, existingUser.role);

    const restaurant =
      existingUser.role === "owner"
        ? await Restaurant.findOne({
            owner: existingUser._id,
          })
        : null;

    return res.json({
      token,
      user: existingUser,
      restaurant,
    });
  }

  if (existingUser) {
    otpStore.delete(email);

    return res.status(409).json({
      message:
        "An account with this email already exists. Please log in instead.",
    });
  }

  if (!name) {
    return res.status(400).json({
      message: "Name is required to create an account",
    });
  }

  if (!phone) {
    return res.status(400).json({
      message: "Phone number is required to create an account",
    });
  }

  if (!address) {
    return res.status(400).json({
      message: "Address is required to create an account",
    });
  }

  const user = await User.create({
    name,
    email,
    phone,
    address,
    role,
  });

  otpStore.delete(email);

  const token = generateToken(user._id, user.role);

  const restaurant =
    user.role === "owner"
      ? await Restaurant.findOne({
          owner: user._id,
        })
      : null;

  return res.status(201).json({
    token,
    user,
    restaurant,
  });
}

async function getMe(req, res) {
  const restaurant =
    req.user.role === "owner"
      ? await Restaurant.findOne({
          owner: req.user._id,
        })
      : null;

  res.json({
    user: req.user,
    restaurant,
  });
}

async function updateProfile(req, res) {
  const { name, username, phone, address } = req.body;

  if (name !== undefined) {
    req.user.name = name;
  }

  if (username !== undefined) {
    req.user.username = username;
  }

  if (phone !== undefined) {
    req.user.phone = phone;
  }

  if (address !== undefined) {
    req.user.address = address;
  }

  await req.user.save();

  res.json({
    user: req.user,
  });
}

async function deleteAccount(req, res) {
  if (req.user.role === "owner") {
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
    });

    if (restaurant) {
      await Dish.deleteMany({
        restaurant: restaurant._id,
      });

      await restaurant.deleteOne();
    }
  }

  await req.user.deleteOne();

  res.json({
    message: "Account deleted",
  });
}

module.exports = {
  requestOtp,
  verifyOtp,
  getMe,
  updateProfile,
  deleteAccount,
};
