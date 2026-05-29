import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { HTTP_STATUS } from "../constants/http.constants";

export const validateBody = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Request validation failed",
      issues: parsed.error.flatten(),
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
    return;
  }

  req.body = parsed.data;
  next();
};

