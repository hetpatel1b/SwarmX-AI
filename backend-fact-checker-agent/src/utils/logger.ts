import winston from "winston";
import { env, isProduction, isTest } from "../configs/env.config";

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  isProduction ? winston.format.json() : winston.format.simple()
);

export const logger = winston.createLogger({
  level: isTest ? "silent" : env.NODE_ENV === "development" ? "debug" : "info",
  format,
  defaultMeta: { service: "backend-fact-checker-agent" },
  transports: [new winston.transports.Console()]
});

