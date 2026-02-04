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
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Block disposable emails
    if (isDisposableEmail(email)) {
      return res.status(400).json({ message: "Disposable email not allowed" });
    }

    // Check existing user
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    user = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      provider: "local",
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send OTP email
    await sendOTP(email, otp);

    return res.status(201).json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};


// =======================
// LOGIN USER (BLOCK IF NOT VERIFIED)
// =======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Fetch user with password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Block login if OTP not verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify email first" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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
    res.status(500).json({ message: "Something went wrong" });
  }
};


// =======================
// GET PROFILE
// =======================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
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
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profile-pictures",
      width: 500,
      height: 500,
      crop: "limit",
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true }
    ).select("-password");

    // Delete temp file
    fs.unlink(file.path, () => {});

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("PROFILE PIC ERROR:", error);
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports = {
  register,
  login,
  getProfile,
  updateProfilePicture,
};
