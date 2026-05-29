export interface FactCheckRequest {
  claim: string;
  context?: string;
  language?: string;
  includeQueue?: boolean;
}

export interface VerifyUrlRequest {
  url: string;
  claim?: string;
}

export interface ExtractClaimsRequest {
  text: string;
}

export interface TrustedSource {
  title: string;
  url: string;
  snippet: string;
  publisher?: string;
  publishedAt?: string;
  score: number;
}

export interface Citation {
  id: number;
  title: string;
  url: string;
  publisher?: string;
  excerpt: string;
}

export interface SourceCredibility {
  title: string;
  url: string;
  publisher?: string;
  score: number;
  rating: "high" | "medium" | "low";
}

export interface FactCheckResponse {
  success: boolean;
  claim: string;
  verification: string;
  confidenceScore: number;
  riskLevel: string;
  hallucinationDetected: boolean;
  analysis: string;
  sources: TrustedSource[];
  citations: Citation[];
  sourceCredibility: SourceCredibility[];
  processingTime: string;
  timestamp: string;
}

