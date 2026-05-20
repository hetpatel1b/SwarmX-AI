import morgan from "morgan";
import { logger } from "../utils/logger";

const stream = {
  write: (message: string): void => {
    logger.http(message.trim());
  }
};

export const httpLogger = morgan(":method :url :status :response-time ms - :res[content-length]", {
  stream
});
