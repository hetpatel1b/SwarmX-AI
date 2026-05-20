export type RiskLevel = "low" | "medium" | "high" | "critical";
export type VerificationVerdict = "true" | "mostly_true" | "mixed" | "mostly_false" | "false" | "unverified";

export interface TrustedSource {
  title: string;
  url: string;
  snippet: string;
  publisher?: string;
  publishedAt?: string;
  score: number;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  quote: string;
  relevanceScore: number;
}

export interface SourceCredibility {
  url: string;
  domain: string;
  credibilityScore: number;
  rationale: string;
}

export interface FactCheckRequest {
  claim: string;
  context?: string;
  language?: string;
  includeQueue?: boolean;
}

export interface UrlVerificationRequest {
  url: string;
  claim?: string;
}

export interface ClaimExtractionRequest {
  text: string;
}

export interface FactCheckResponse {
  success: boolean;
  claim: string;
  verification: VerificationVerdict | string;
  confidenceScore: number;
  riskLevel: RiskLevel | string;
  hallucinationDetected: boolean;
  analysis: string;
  sources: TrustedSource[];
  citations: Citation[];
  sourceCredibility: SourceCredibility[];
  processingTime: string;
  timestamp: string;
}
