import { env } from "./env.config";

export const searchConfig = {
  tavily: {
    apiKey: env.TAVILY_API_KEY,
    endpoint: "https://api.tavily.com/search",
    searchDepth: env.TAVILY_SEARCH_DEPTH
  },
  serper: {
    apiKey: env.SERPER_API_KEY,
    endpoint: "https://google.serper.dev/search"
  }
};

export const isTavilyConfigured = (): boolean => Boolean(searchConfig.tavily.apiKey);
export const isSerperConfigured = (): boolean => Boolean(searchConfig.serper.apiKey);

