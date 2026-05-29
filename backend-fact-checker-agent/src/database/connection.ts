import { logger } from "../utils/logger";

export const initializeDatabase = async (): Promise<void> => {
  logger.info("No relational database configured; service uses Tavily, Serper, and Redis adapters");
};
