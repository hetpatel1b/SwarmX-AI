require("dotenv").config();
const express = require("express");
const cors = require("cors");
const summarizeRouter = require("./routes/summarize");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", summarizeRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Summarizer Agent backend listening on port ${PORT}`);
  console.log(`Model: ${process.env.PHI_MODEL}`);
  console.log(`Endpoint: ${process.env.AZURE_ENDPOINT}`);
});
