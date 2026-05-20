import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HTTP_STATUS } from "../constants/http.constants";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { isProduction } from "../configs/env.config";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND));
};

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode =
    error instanceof AppError ? error.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  const message =
    error instanceof ZodError
      ? "Request validation failed"
      : statusCode >= 500 && isProduction
        ? "Internal server error"
        : error.message;

  logger.error("Request failed", {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    error: error.message,
    stack: isProduction ? undefined : error.stack
  });

  res.status(statusCode).json({
    success: false,
    message,
    requestId: req.requestId,
    errors: error instanceof ZodError ? error.flatten() : undefined,
    timestamp: new Date().toISOString()
  });
};
