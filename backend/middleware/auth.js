import { logger } from "../utils/logger.js";

let warnedOnce = false;

/**
 * C-3 FIX: API key authentication middleware.
 *
 * Reads CLIENT_API_KEYS from env (comma-separated).
 * - If no keys are configured → auth is skipped with a one-time warning (backward compatible).
 * - If keys are configured → the client must send a valid key via the X-API-Key header.
 */
export const apiKeyAuth = (req, res, next) => {
  const validKeys = (process.env.CLIENT_API_KEYS || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  // Backward compatible: skip auth if no keys are configured
  if (validKeys.length === 0) {
    if (!warnedOnce) {
      logger.warn(
        "CLIENT_API_KEYS not configured — API authentication is disabled. " +
          "Set CLIENT_API_KEYS in .env for production."
      );
      warnedOnce = true;
    }
    return next();
  }

  const clientKey = req.headers["x-api-key"];

  if (!clientKey || !validKeys.includes(clientKey)) {
    return res.status(401).json({
      success: false,
      error: {
        name: "Unauthorized",
        message: "Valid API key required. Set the X-API-Key header."
      }
    });
  }

  return next();
};
