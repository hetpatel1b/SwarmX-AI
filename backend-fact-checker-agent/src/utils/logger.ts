import winston from "winston";
import { isProduction } from "../configs/env.config";

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format,
  defaultMeta: { service: "backend-fact-checker-agent" },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? format
        : winston.format.combine(winston.format.colorize(), winston.format.simple())
    })
  ]
});
