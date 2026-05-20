import { AzureKeyCredential, SearchClient } from "@azure/search-documents";
import { AzureChatOpenAI } from "@langchain/openai";
import { env } from "./env.config";

export const azureConfig = {
  openAi: {
    apiKey: env.AZURE_OPENAI_API_KEY,
    endpoint: env.AZURE_OPENAI_ENDPOINT,
    deployment: env.AZURE_OPENAI_DEPLOYMENT
  },
  search: {
    endpoint: env.AZURE_AI_SEARCH_ENDPOINT,
    apiKey: env.AZURE_AI_SEARCH_API_KEY,
    index: env.AZURE_AI_SEARCH_INDEX
  }
};

export const isAzureOpenAiConfigured = (): boolean =>
  Boolean(azureConfig.openAi.apiKey && azureConfig.openAi.endpoint && azureConfig.openAi.deployment);

export const isAzureSearchConfigured = (): boolean =>
  Boolean(azureConfig.search.endpoint && azureConfig.search.apiKey && azureConfig.search.index);

export const createAzureChatModel = (): AzureChatOpenAI | null => {
  if (!isAzureOpenAiConfigured()) return null;

  return new AzureChatOpenAI({
    azureOpenAIApiKey: azureConfig.openAi.apiKey,
    azureOpenAIApiInstanceName: new URL(azureConfig.openAi.endpoint).hostname.split(".")[0],
    azureOpenAIApiDeploymentName: azureConfig.openAi.deployment,
    azureOpenAIApiVersion: "2024-06-01",
    temperature: 0.1,
    maxRetries: 2
  });
};

export const createSearchClient = (): SearchClient<Record<string, unknown>> | null => {
  if (!isAzureSearchConfigured()) return null;

  return new SearchClient<Record<string, unknown>>(
    azureConfig.search.endpoint,
    azureConfig.search.index,
    new AzureKeyCredential(azureConfig.search.apiKey)
  );
};
