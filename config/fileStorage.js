const multer = require("multer");

const fileFilter = (req, file, cb) => {
  console.log("File received:", file);
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// Configure multer to use memory storage (won't save to disk)
const upload = multer({
  storage: multer.memoryStorage(), // This keeps the file in memory
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = { upload };
