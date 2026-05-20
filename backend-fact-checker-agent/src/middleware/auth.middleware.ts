import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../configs/env.config";
import { HTTP_STATUS } from "../constants/http.constants";
import { AppError } from "../utils/AppError";

declare module "express-serve-static-core" {
  interface Request {
    user?: string | jwt.JwtPayload;
  }
}

export const authenticateJwt = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.header("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    next(new AppError("Missing bearer token", HTTP_STATUS.UNAUTHORIZED));
    return;
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    next(new AppError("Invalid or expired token", HTTP_STATUS.UNAUTHORIZED));
  }
};

export const optionalJwt = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.header("authorization")?.replace("Bearer ", "");
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
  } catch {
    req.user = undefined;
  }
  return next();
};
