import { env } from "./config/env.js";
import { buildApp } from "./app.js";
import { logger } from "./utils/logger.js";

const app = buildApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "Presentation Agent API listening");
});
