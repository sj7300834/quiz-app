const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const sendOTP = require("../utils/emailService");
const isDisposableEmail = require("../utils/disposableEmailCheck");

// =======================
// REGISTER USER + SEND OTP
// =======================
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars, include upper, lower, number and symbol",
      });
    }

    // Trusted domain validation
    const allowedDomains = ["gmail.com", "outlook.com", "yahoo.com"];
    const domain = email.split("@")[1];

    if (!allowedDomains.includes(domain)) {
      return res.status(400).json({
        message: "Use valid email provider",
      });
    }

    // Block disposable emails
    if (isDisposableEmail(email)) {
      return res.status(400).json({
        message: "Disposable email not allowed",
      });
    }

    // Check existing user
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Auto username from email
    const username = email.split("@")[0];

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    user = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      provider: "local",
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
    });

    // Send OTP first
    await sendOTP(email, otp);

    // Save after OTP success
    await user.save();

    return res.status(201).json({
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

// =======================
// LOGIN USER (BLOCK IF NOT VERIFIED)
// =======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// =======================
// GET PROFILE
// =======================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("PROFILE ERROR:", error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// =======================
// UPDATE PROFILE PICTURE
// =======================
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profile-pictures",
      width: 500,
      height: 500,
      crop: "limit",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: result.secure_url,
      },
      {
        new: true,
      }
    ).select("-password");

    fs.unlink(file.path, () => {});

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("PROFILE PIC ERROR:", error);

    if (req.file) fs.unlink(req.file.path, () => {});

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfilePicture,
};