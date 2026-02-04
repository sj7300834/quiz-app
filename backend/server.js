// =========================
// ENV LOAD (MUST BE FIRST)
// =========================
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const cloudinary = require("cloudinary").v2;

const questionRoutes = require("./routes/questionRoutes");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contact");

// =========================
// DEBUG ENV (TEMP)
// =========================
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "Loaded" : "Not Loaded");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "Not Loaded");

// =========================
// CLOUDINARY CONFIG
// =========================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// =========================
// TRUST PROXY
// =========================
app.set("trust proxy", 1);

// =========================
// SECURITY
// =========================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// =========================
// RATE LIMIT
// =========================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// =========================
// LOGGING
// =========================
app.use(morgan("dev"));

// =========================
// CORS CONFIG
// =========================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight
app.options("*", cors());

// =========================
// BODY PARSER
// =========================
app.use(express.json());

// =========================
// STATIC FILES
// =========================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// DATABASE CONNECTION
// =========================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// =========================
// ROUTES
// =========================
app.use("/api/questions", questionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", contactRoutes);

// =========================
// 404 HANDLER
// =========================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// =========================
// GLOBAL ERROR HANDLER
// =========================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// =========================
// SERVER START
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
