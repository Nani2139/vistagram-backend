const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(__dirname, "../uploads");
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }
};

// Configure multer storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB - reduced for faster processing
    fieldSize: 10 * 1024 * 1024, // 10MB for field size
  },
});

// Error handling middleware for multer errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size allowed is 10MB`,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field",
      });
    }
  }
  next(error);
};

// Image processing middleware - Optimized for speed
const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    console.log("Processing image - Size:", req.file.buffer.length, "bytes");
    const filename = `${uuidv4()}.jpg`;

    // Optimize image processing for speed
    const processedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, {
        // Smaller size for faster processing
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 70 }) // Lower quality for faster processing
      .toBuffer();

    console.log("Image processed - New size:", processedBuffer.length, "bytes");

    // Convert to base64 for storage in database
    const base64Image = `data:image/jpeg;base64,${processedBuffer.toString(
      "base64"
    )}`;

    console.log("Base64 conversion complete - Length:", base64Image.length);

    // Update file info
    req.file.filename = filename;
    req.file.path = base64Image; // Store base64 instead of file path
    req.file.processed = true;

    next();
  } catch (error) {
    console.error("Image processing error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Initialize uploads directory and export middleware
const initializeUploads = async () => {
  await ensureUploadsDir();
};

module.exports = {
  upload: upload.single("image"),
  processImage,
  handleUploadError,
  initializeUploads,
};
