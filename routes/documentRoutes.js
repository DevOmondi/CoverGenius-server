const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { upload } = require("../config/fileStorage");

router.post(
  "/extract-text",
  upload.single("file"),
  documentController.extractText
);
router.post(
  "/generate-cover-letter",
  documentController.aiLimiter,
  documentController.generateCoverLetter
);

module.exports = router;
