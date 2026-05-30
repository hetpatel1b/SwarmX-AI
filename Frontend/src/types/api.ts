export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorPayload {
  name: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthData {
  status?: string;
  message?: string;
  uptime?: number;
  timestamp?: string;
  [key: string]: unknown;
}

export interface ResearchRequest {
  query: string;
}

export interface SummarizeRequest {
  rawText: string;
}

export interface FactCheckRequest {
  claim: string;
  context: string;
}

export interface InsightsRequest {
  rawText: string;
  summary: string;
  keyInsights: string[];
  conclusion: string;
  verifiedFacts: string[];
  trustScore: number;
}

export interface PipelineRequest {
  query: string;
}

export interface ResearchData {
  report?: string;
  research?: string;
  rawText?: string;
  sources?: unknown[];
  [key: string]: unknown;
}

export interface SummaryData {
  summary?: string;
  keyPoints?: string[];
  conclusion?: string;
  [key: string]: unknown;
}

export interface FactCheckData {
  factcheck?: string;
  verifiedFacts?: string[];
  claims?: unknown[];
  trustScore?: number;
  [key: string]: unknown;
}

export interface InsightsData {
  insights?: string;
  keyInsights?: string[];
  recommendations?: string[];
  conclusion?: string;
  trustScore?: number;
  [key: string]: unknown;
}

export interface PipelineData {
  query?: string;
  pipeline?: PipelineData;
  research?: string | ResearchData;
  factcheck?: string | FactCheckData;
  factCheck?: string | FactCheckData;
  insights?: string | InsightsData;
  summary?: string | SummaryData;
  presentation?: string | { slides?: unknown[]; outline?: string; content?: string; [key: string]: unknown };
  rawText?: string;
  report?: string;
  keyInsights?: string[];
  verifiedFacts?: string[];
  conclusion?: string;
  trustScore?: number;
  processingTime?: number;
  agents?: unknown[];
  [key: string]: unknown;
}
