const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require("tesseract.js");
const fs = require("fs");

exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractedText = "";
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    // Process based on file type
    if (fileType === "application/pdf") {
      const data = await pdf(fileBuffer);
      extractedText = data.text;
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (fileType.startsWith("image/")) {
      const worker = await createWorker();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const {
        data: { text },
      } = await worker.recognize(fileBuffer);
      extractedText = text;
      await worker.terminate();
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (!extractedText.trim()) {
      return res
        .status(400)
        .json({ error: "No text could be extracted from the file" });
    }

    res.json({ extractedText });
  } catch (error) {
    console.error("Error extracting text:", error);
    res.status(500).json({ error: "Failed to extract text from file" });
  }
};
