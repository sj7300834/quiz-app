const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { register, login, getProfile, updateProfilePicture } = require("../controllers/authController");
const upload = require("../middleware/upload");

const verifyGoogleToken = require("../utils/googleAuth");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// =======================
// NORMAL SIGNUP
// =======================
router.post("/signup", register);


// =======================
// VERIFY OTP
// =======================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Convert OTP to string for safe compare
    if (user.otp !== otp.toString() || user.otpExpires < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ msg: "Email verified successfully" });

  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ msg: "OTP verification failed" });
  }
});


// =======================
// GOOGLE LOGIN
// =======================
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ msg: "Google token missing" });
    }

    const payload = await verifyGoogleToken(token);
    if (!payload) {
      return res.status(401).json({ msg: "Invalid Google token" });
    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    // Create user if not exists
    if (!user) {
      user = await User.create({
        name,
        email,
        picture,
        username: name.replace(/\s/g, "").toLowerCase(), // ✅ FIX
        provider: "google",
        isVerified: true,
      });
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token: jwtToken, user });

  } catch (err) {
    console.error("❌ Google Login Error:", err.message);
    res.status(401).json({ msg: "Google login failed" });
  }
});


// =======================
// NORMAL LOGIN
// =======================
router.post("/login", login);


// =======================
// PROFILE
// =======================
router.get("/profile", authMiddleware, getProfile);


// =======================
// UPLOAD PROFILE PIC
// =======================
router.post(
  "/upload-profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfilePicture
);

module.exports = router;
