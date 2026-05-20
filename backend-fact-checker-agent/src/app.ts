import compression from "compression";
import express, { Application } from "express";
import routes from "./routes";
import { API_PREFIX } from "./constants/http.constants";
import { apiRateLimiter } from "./middleware/rateLimit.middleware";
import { corsMiddleware, helmetMiddleware, sanitizeRequest } from "./middleware/security.middleware";
import { globalErrorHandler, notFoundHandler } from "./middleware/error.middleware";
import { httpLogger } from "./middleware/logging.middleware";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { swaggerServe, swaggerSetup } from "./docs/swagger";

export const createApp = (): Application => {
  const app = express();

  app.disable("x-powered-by");
  app.use(requestIdMiddleware);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(sanitizeRequest);
  app.use(httpLogger);
  app.use(apiRateLimiter);

  app.use("/docs", swaggerServe, swaggerSetup);
  app.use(API_PREFIX, routes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};

export default createApp();
