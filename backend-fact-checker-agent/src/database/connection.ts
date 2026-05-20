import { logger } from "../utils/logger";

export const initializeDatabase = async (): Promise<void> => {
  logger.info("No relational database configured; service uses Azure Search and Redis adapters");
};
