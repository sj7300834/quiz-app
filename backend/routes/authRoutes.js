const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware"); // Fixed import
const { register, login, getProfile, updateProfilePicture } = require("../controllers/authController");
const upload = require("../middleware/upload");

// @route   POST /auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", register);

// @route   POST /auth/login
// @desc    Login an existing user
// @access  Public
router.post("/login", login);

// @route   GET /auth/profile
// @desc    Get authenticated user's profile
// @access  Private
router.get("/profile", authMiddleware, getProfile);

// @route   POST /auth/upload-profile-picture
// @desc    Upload profile picture for authenticated user
// @access  Private
router.post("/upload-profile-picture", authMiddleware, upload.single("profilePicture"), updateProfilePicture);

module.exports = router;