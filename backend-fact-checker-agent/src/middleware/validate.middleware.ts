import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { HTTP_STATUS } from "../constants/http.constants";

export const validateBody =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid request payload",
        errors: result.error.flatten(),
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
      return;
    }
    req.body = result.data;
    next();
  };
