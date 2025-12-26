const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary config (env se)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage (NO local uploads folder)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "quiz-app/profile-pictures", // Cloudinary folder name
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 400, height: 400, crop: "limit" },
    ],
  },
});

// Multer config
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (same as before)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = upload;
