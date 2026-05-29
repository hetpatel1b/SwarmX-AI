import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingRequestId = req.header("x-request-id");
  req.requestId = incomingRequestId || crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
};

