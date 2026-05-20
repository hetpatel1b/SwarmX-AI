import rateLimit from "express-rate-limit";
import { HTTP_STATUS } from "../constants/http.constants";

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please retry shortly."
  },
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS
});

export const factCheckRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Fact-checking rate limit exceeded."
  }
});
