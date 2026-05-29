import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http.constants";
import { isProduction } from "../configs/env.config";
import { logger } from "../utils/logger";

export const notFoundMiddleware = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
};

export const errorMiddleware = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const message = error instanceof Error ? error.message : "Unexpected server error";

  logger.error("Unhandled request error", {
    message,
    stack: error instanceof Error ? error.stack : undefined,
    requestId: req.requestId
  });

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: isProduction ? "Internal server error" : message,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
};

