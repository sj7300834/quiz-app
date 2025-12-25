const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = { id: user._id };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    } else {
      console.error("Unexpected JWT error:", err);
      return res.status(401).json({ message: "Token is not valid. Please log in again." });
    }
  }
};

const getAuthenticatedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching authenticated user:", error);
    res.status(500).json({ message: "Failed to fetch authenticated user" });
  }
};

module.exports = { authMiddleware, getAuthenticatedUser };