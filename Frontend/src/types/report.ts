export type ClaimVerdict = "verified" | "contradicted" | "unverified";

export interface ReportSource {
  id: string;
  title: string;
  url?: string;
  domain?: string;
  type: "academic" | "news" | "company" | "government" | "web" | "unknown";
  reliability: number;
}

export interface KeyFinding {
  id: string;
  title: string;
  detail: string;
  confidence: number;
  sourceIds: string[];
}

export interface EvidenceItem {
  id: string;
  claim: string;
  evidence: string;
  sourceIds: string[];
  confidence: number;
}

export interface ClaimReview {
  id: string;
  claim: string;
  verdict: ClaimVerdict;
  rationale: string;
  confidence: number;
  sourceIds: string[];
}

export interface StrategicItem {
  id: string;
  title: string;
  detail: string;
  impact: number;
  effort: number;
  confidence: number;
  priority: "High" | "Medium" | "Low";
}

export interface StructuredSummary {
  executiveSummary: string;
  mattersMost: string[];
  recommendedActions: StrategicItem[];
  riskAreas: StrategicItem[];
  nextSteps: string[];
}

export interface StructuredReport {
  executiveAnswer: string;
  keyFindings: KeyFinding[];
  evidence: EvidenceItem[];
  sources: ReportSource[];
  citationCoverage: number;
  researchConfidence: number;
  claims: ClaimReview[];
  opportunities: StrategicItem[];
  risks: StrategicItem[];
  recommendations: StrategicItem[];
  keyTakeaways: string[];
  summary: StructuredSummary;
}
