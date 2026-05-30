import type { AgentId, AgentState } from "@/types/swarm";
import {
  Brain,
  ShieldCheck,
  Lightbulb,
  FileText,
  Presentation,
  type LucideIcon
} from "lucide-react";

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
  research: [
    "🔍 Initializing neural search across knowledge bases...",
    "📡 Scanning academic and web sources...",
    "🧠 Synthesizing findings into coherent research report...",
    "📊 Cross-referencing data points for accuracy..."
  ],
  factcheck: [
    "🛡️ Loading claim verification protocols...",
    "⚖️ Cross-validating statements against trusted sources...",
    "🔬 Analyzing evidence consistency and reliability...",
    "✅ Computing trust score from verification results..."
  ],
  insights: [
    "💡 Scanning for emergent patterns and anomalies...",
    "🔮 Running predictive analysis on research data...",
    "📈 Generating strategic recommendations...",
    "🎯 Prioritizing high-impact signals..."
  ],
  summary: [
    "📝 Extracting key points from all agent outputs...",
    "🗜️ Compressing findings into executive brief...",
    "✍️ Crafting narrative structure for stakeholders...",
    "📋 Finalizing executive summary document..."
  ],
  presentation: [
    "🎨 Designing presentation narrative flow...",
    "📊 Building slide deck structure...",
    "🖼️ Creating visual storytelling elements...",
    "🚀 Preparing export-ready deliverables..."
  ]
};

export const agentOrder = defaultAgents.map((agent) => agent.id);

// ─── Agent Visual Identity System ───

export interface AgentIdentity {
  id: AgentId;
  icon: LucideIcon;
  color: string;
  gradient: string;
  glowClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  dotClass: string;
  progressColor: "cyan" | "emerald" | "violet" | "amber" | "rose";
  cardGlow: "cyan" | "emerald" | "violet" | "amber" | "rose";
}

export const agentIdentities: Record<AgentId, AgentIdentity> = {
  research: {
    id: "research",
    icon: Brain,
    color: "#06b6d4",
    gradient: "from-cyan-500 to-cyan-300",
    glowClass: "neural-glow-cyan",
    borderClass: "border-cyan-500/30",
    bgClass: "bg-cyan-500/10",
    textClass: "text-cyan-400",
    dotClass: "bg-cyan-400",
    progressColor: "cyan",
    cardGlow: "cyan"
  },
  factcheck: {
    id: "factcheck",
    icon: ShieldCheck,
    color: "#10b981",
    gradient: "from-emerald-500 to-emerald-300",
    glowClass: "neural-glow-emerald",
    borderClass: "border-emerald-500/30",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-400",
    dotClass: "bg-emerald-400",
    progressColor: "emerald",
    cardGlow: "emerald"
  },
  insights: {
    id: "insights",
    icon: Lightbulb,
    color: "#8b5cf6",
    gradient: "from-violet-500 to-violet-300",
    glowClass: "neural-glow-violet",
    borderClass: "border-violet-500/30",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-400",
    dotClass: "bg-violet-400",
    progressColor: "violet",
    cardGlow: "violet"
  },
  summary: {
    id: "summary",
    icon: FileText,
    color: "#f59e0b",
    gradient: "from-amber-500 to-amber-300",
    glowClass: "neural-glow-amber",
    borderClass: "border-amber-500/30",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-400",
    dotClass: "bg-amber-400",
    progressColor: "amber",
    cardGlow: "amber"
  },
  presentation: {
    id: "presentation",
    icon: Presentation,
    color: "#f43f5e",
    gradient: "from-rose-500 to-rose-300",
    glowClass: "neural-glow-rose",
    borderClass: "border-rose-500/30",
    bgClass: "bg-rose-500/10",
    textClass: "text-rose-400",
    dotClass: "bg-rose-400",
    progressColor: "rose",
    cardGlow: "rose"
  }
};
