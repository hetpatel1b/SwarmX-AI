import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { apiKeyAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";
import researchRoutes from "./routes/research.js";
import factcheckRoutes from "./routes/factcheck.js";
import pipelineRoutes from "./routes/pipeline.js";
import presentationRoutes from "./routes/presentation.js";

const app = express();

app.disable("x-powered-by");

// H-2 FIX: Only trust proxy headers when explicitly configured behind a reverse proxy
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

// H-6 FIX: Essential HTTP security headers (X-Content-Type-Options, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// C-2 FIX: Restricted CORS — only allow known frontend origins instead of wildcard "*"
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000"
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, server-to-server, mobile apps)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "X-API-Key",
      "X-SwarmX-Client",
      "X-SwarmX-Environment",
      "X-Request-ID"
    ],
    credentials: true
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));

// C-4 FIX: Rate limiting on API routes — 20 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      name: "RateLimited",
      message: "Too many requests. Please try again shortly."
    }
  }
});

// Public endpoints (no auth, no rate limit)
app.get("/", (_req, res) => {
  res.json({ status: "online", message: "SwarmX API running" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Apply rate limiting and authentication to all /api/* routes
app.use("/api", apiLimiter);
app.use("/api", apiKeyAuth);

// Routes
app.use("/api/research", researchRoutes);
app.use("/api/factcheck", factcheckRoutes);
app.use("/api/pipeline", pipelineRoutes);
app.use("/api/presentation", presentationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
