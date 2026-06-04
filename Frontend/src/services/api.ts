import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { apiBaseUrl, appName, environment } from "@/config/env";
import type { ApiResponse } from "@/types/api";

const API_TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 700;

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  isTimeout: boolean;
  isNetworkError: boolean;

  constructor(message: string, options: { status?: number; code?: string; isTimeout?: boolean; isNetworkError?: boolean } = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.isTimeout = Boolean(options.isTimeout);
    this.isNetworkError = Boolean(options.isNetworkError);
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  config.headers.set("X-SwarmX-Client", appName);
  config.headers.set("X-SwarmX-Environment", environment);
  config.headers.set("X-Request-ID", crypto.randomUUID());
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => Promise.reject(normalizeApiError(error))
);

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function shouldRetry(error: unknown, attempt: number) {
  if (attempt >= MAX_RETRIES) return false;
  if (!(error instanceof ApiClientError)) return false;
  if (error.isTimeout || error.isNetworkError) return true;
  return typeof error.status === "number" && error.status >= 500;
}

export async function requestWithRetry<T>(config: AxiosRequestConfig): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await apiClient.request<ApiResponse<T> | T>(config);
      return unwrapApiResponse<T>(response.data);
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error, attempt)) break;
      await delay(RETRY_DELAY_MS * (attempt + 1));
    }
  }
  throw lastError;
}

export function unwrapApiResponse<T>(payload: ApiResponse<T> | T): T {
  if (!payload || typeof payload !== "object" || !("success" in payload)) {
    return payload as T;
  }

  const response = payload as ApiResponse<T>;
  if (response.success) {
    return ('data' in response ? response.data : response) as T;
  }

  throw new ApiClientError(response.error?.message || "The backend returned an error.", {
    code: response.error?.name
  });
}

export function normalizeApiError(error: AxiosError<ApiResponse<unknown>> | unknown) {
  if (error instanceof ApiClientError) return error;

  if (!axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return new ApiClientError(error instanceof Error ? error.message : "Unexpected frontend error.");
  }

  const backendError = error.response?.data && "success" in error.response.data && !error.response.data.success ? error.response.data.error : null;

  if (error.code === "ECONNABORTED") {
    return new ApiClientError("The backend request timed out. Please try again.", {
      status: error.response?.status,
      code: error.code,
      isTimeout: true
    });
  }

  if (!error.response) {
    return new ApiClientError("Network failure. Check your internet connection or backend deployment status.", {
      code: error.code,
      isNetworkError: true
    });
  }

  return new ApiClientError(
    backendError?.message || `Backend request failed with status ${error.response.status}.`,
    {
      status: error.response.status,
      code: backendError?.name || error.code,
      isNetworkError: false
    }
  );
}
