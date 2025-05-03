require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// const authRoutes = require("./routes/authRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/payment", paymentRoutes);
app.use("/api/documents", documentRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
