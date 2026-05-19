const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const researchRoutes = require("./routes/researchRoutes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "research-agent",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/research", researchRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.originalUrl} does not exist`
  });
});

app.use((error, _req, res, _next) => {
  console.error("[research-agent] Request failed:", error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    error: error.name || "InternalServerError",
    message:
      statusCode === 500
        ? "An unexpected error occurred while processing the research request"
        : error.message
  });
});

module.exports = app;
