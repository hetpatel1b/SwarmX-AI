const axios = require("axios");
const config = require("../config/config");

const createAzureOpenAIUrl = () => {
  const { endpoint, deploymentName, apiVersion } = config.azureOpenAI;

  if (!endpoint || !deploymentName || !apiVersion) {
    const error = new Error("Azure OpenAI configuration is incomplete");
    error.statusCode = 500;
    throw error;
  }

  const normalizedEndpoint = endpoint.replace(/\/$/, "");

  return `${normalizedEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
};

const createChatCompletion = async (messages) => {
  if (!config.azureOpenAI.apiKey) {
    const error = new Error("Azure OpenAI API key is missing");
    error.statusCode = 500;
    throw error;
  }

  try {
    const response = await axios.post(
      createAzureOpenAIUrl(),
      {
        messages,
        temperature: config.ai.temperature,
        max_tokens: config.ai.maxTokens,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": config.azureOpenAI.apiKey
        },
        timeout: 30000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      const error = new Error("Azure OpenAI returned an empty response");
      error.statusCode = 502;
      throw error;
    }

    return content;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    const serviceError = new Error(
      error.response?.data?.error?.message ||
        error.message ||
        "Azure OpenAI request failed"
    );

    serviceError.name = "AzureOpenAIError";
    serviceError.statusCode = error.response?.status || 502;
    serviceError.details = error.response?.data;

    console.error("[research-agent] Azure OpenAI error:", {
      status: serviceError.statusCode,
      message: serviceError.message
    });

    throw serviceError;
  }
};

module.exports = {
  createChatCompletion
};
