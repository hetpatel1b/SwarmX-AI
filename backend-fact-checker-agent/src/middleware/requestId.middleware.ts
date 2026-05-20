import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = req.header("x-request-id") || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
