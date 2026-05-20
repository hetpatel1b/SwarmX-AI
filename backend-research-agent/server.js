import app from "./src/app.js";
import { appConfig } from "./src/config/groq.js";
import { logger } from "./src/utils/logger.js";

const server = app.listen(appConfig.port, () => {
  logger.info(
    `Server running on http://localhost:${appConfig.port} in ${appConfig.nodeEnv} mode`
  );
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { message: error.message });
  server.close(() => process.exit(1));
});
