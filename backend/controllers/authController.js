const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Update Profile Picture
const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "profile-pictures",
      width: 500,
      height: 500,
      crop: "limit",
    });

    if (!result || !result.secure_url) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    // Update user profile picture with Cloudinary URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: result.secure_url },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete temporary file
    fs.unlink(file.path, (err) => {
      if (err) console.error("Error deleting temp file:", err);
    });

    res.status(200).json({ message: "Profile picture updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile picture:", error.message, error);
    // Delete file in case of error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// Export all functions
module.exports = {
  register,
  login,
  getProfile,
  updateProfilePicture,
};