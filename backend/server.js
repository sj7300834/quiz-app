const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;
const questionRoutes = require("./routes/questionRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contact");

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create the express app
const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan("dev"));

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"], // Added more headers
  })
);

// Handle preflight requests
app.options("*", cors());

// Middleware
app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", contactRoutes);

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  } else if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Unauthorized access" });
  } else if (err.name === "MongoError") {
    return res.status(500).json({ message: "Database error" });
  }

  res.status(500).json({ message: "Internal Server Error" });
});

// Set up the server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});