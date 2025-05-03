const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { createWorker } = require("tesseract.js");
const aiService = require("../services/aiService");
const sanitizeHtml = require("sanitize-html");
const { rateLimit } = require("express-rate-limit");
const NodeCache = require("node-cache");

// Cache with 1 hour TTL
const jobDescriptionCache = new NodeCache({ stdTTL: 3600 });

// Rate limiter for AI endpoints
exports.aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Extract text from PDF, DOCX, and image files
exports.extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let extractedText = "";
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

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
      const {
        data: { text },
      } = await worker.recognize(fileBuffer);
      extractedText = text;
      await worker.terminate();
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: "No text could be extracted" });
    }

    res.json({ extractedText });
  } catch (error) {
    console.error("Error extracting text:", error);
    res.status(500).json({ error: "Failed to extract text from file" });
  }
};

// Generate cover letter based on job description
exports.generateCoverLetter = async (req, res) => {
  try {
    let { jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: "Job description is required" });
    }

    // Sanitize input
    jobDescription = sanitizeHtml(jobDescription, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();

    // Check cache
    const cacheKey = `jd-${jobDescription}`;
    const cachedResponse = jobDescriptionCache.get(cacheKey);

    if (cachedResponse) {
      return res.json({
        coverLetter: cachedResponse,
        cached: true,
      });
    }

    const coverLetter = await aiService.generateCoverLetter(jobDescription);

    // Cache the response
    jobDescriptionCache.set(cacheKey, coverLetter);

    res.json({
      coverLetter,
      cached: false,
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    res.status(500).json({ error: "Failed to generate cover letter" });
  }
};
