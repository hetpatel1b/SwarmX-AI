export type AgentStatus = "Idle" | "Running" | "Completed" | "Failed";

export type AgentId =
  | "research"
  | "factcheck"
  | "insights"
  | "summary"
  | "presentation";

export interface AgentState {
  id: AgentId;
  name: string;
  role: string;
  status: AgentStatus;
  progress: number;
  executionTime: number;
  confidence: number;
}

export interface SwarmResults {
  topic: string;
  research: string;
  factcheck: string;
  insights: string;
  summary: string;
  presentation: string;
  startedAt: string;
  completedAt?: string;
  totalTime: number;
  trustScore: number;
  verifiedFacts: string[];
  keyInsights: string[];
  rawBackendData: unknown;
}

export interface HistoryItem extends SwarmResults {
  id: string;
}

export interface AnalyticsPoint {
  name: string;
  time: number;
  confidence: number;
  throughput: number;
}

export type BackendStatus = "checking" | "online" | "offline";
