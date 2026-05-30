import type { AgentState } from "@/types/swarm";

export const defaultAgents: AgentState[] = [
  {
    id: "research",
    name: "Research Agent",
    role: "Source discovery and deep research",
    status: "Idle",
    progress: 0,
    executionTime: 0,
    confidence: 0
  },
  {
    id: "factcheck",
    name: "Fact Checker Agent",
    role: "Claim verification and consistency",
    status: "Idle",
    progress: 0,
    executionTime: 0,
    confidence: 0
  },
  {
    id: "insights",
    name: "Insight Agent",
    role: "Pattern detection and recommendations",
    status: "Idle",
    progress: 0,
    executionTime: 0,
    confidence: 0
  },
  {
    id: "summary",
    name: "Summarizer Agent",
    role: "Executive synthesis and key points",
    status: "Idle",
    progress: 0,
    executionTime: 0,
    confidence: 0
  },
  {
    id: "presentation",
    name: "Presentation Agent",
    role: "Narrative packaging and slide outline",
    status: "Idle",
    progress: 0,
    executionTime: 0,
    confidence: 0
  }
];

export const thinkingScripts = {
  research: ["Searching sources...", "Analyzing information...", "Generating report..."],
  factcheck: ["Verifying claims...", "Checking consistency...", "Scoring evidence..."],
  insights: ["Finding patterns...", "Generating recommendations...", "Prioritizing signals..."],
  summary: ["Extracting key points...", "Compressing findings...", "Writing executive brief..."],
  presentation: ["Building slides...", "Designing narrative flow...", "Preparing exports..."]
};

export const agentOrder = defaultAgents.map((agent) => agent.id);
