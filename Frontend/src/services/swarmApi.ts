import { requestWithRetry } from "@/services/api";
import type {
  FactCheckData,
  FactCheckRequest,
  HealthData,
  InsightsData,
  InsightsRequest,
  PipelineData,
  PipelineRequest,
  ResearchData,
  ResearchRequest,
  SummarizeRequest,
  SummaryData
} from "@/types/api";
import type { SwarmResults } from "@/types/swarm";

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? `- ${item}` : `- ${JSON.stringify(item)}`))
      .join("\n");
  }
  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return "";
}

function firstText(source: unknown, keys: string[]) {
  if (typeof source === "string") return source;
  if (!source || typeof source !== "object") return "";
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    const text = stringifyValue(value);
    if (text) return text;
  }
  return stringifyValue(source);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
}

function valueFromRecord(value: unknown, key: string) {
  return value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined;
}

function normalizeTrustScore(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value <= 1 ? Math.round(value * 100) : Math.round(value);
  }
  return 0;
}

export function normalizePipelineResults(topic: string, data: PipelineData, startedAt: number): SwarmResults {
  const pipeline = data?.pipeline ?? data ?? {};
  
  const getAgentData = (agentPayload: any) => agentPayload?.data || agentPayload?.fallbackData || agentPayload || {};
  
  const researchAgent = getAgentData(pipeline?.research);
  const factCheckAgent = getAgentData(pipeline?.factcheck ?? pipeline?.factCheck);
  const insightsAgent = getAgentData(pipeline?.insight ?? pipeline?.insights);
  const summaryAgent = getAgentData(pipeline?.summary);
  const presentationAgent = getAgentData(pipeline?.presentation);

  const research = firstText(researchAgent?.report ?? researchAgent?.rawText ?? researchAgent, ["overview", "rawData", "report", "research", "rawText", "content", "text"]);
  let factcheck = "";
  if (factCheckAgent && typeof factCheckAgent === "object") {
    const fd = factCheckAgent as any;
    const fc = fd.filteredContent || fd;
    const vFacts = Array.isArray(fc.verifiedFacts) ? fc.verifiedFacts : [];
    const fClaims = Array.isArray(fc.flaggedClaims) ? fc.flaggedClaims : [];
    const tScore = typeof fc.trustScoreScaled === "number" ? fc.trustScoreScaled : typeof fc.trustScore === "number" ? fc.trustScore : 0;
    const vPct = typeof fc.verifiedPercentage === "number" ? fc.verifiedPercentage : 0;
    const breakdown = Array.isArray(fc.breakdown) ? fc.breakdown : [];
    const warning = fc.warning || (vPct <= 30 && vPct > 0 ? "Low verification rate — results may be unreliable" : "");

    factcheck = `### Trust Score\n**${tScore}%**\n\n### Verified Percentage\n**${vPct.toFixed(1)}%**\n\n`;
    if (warning) {
      factcheck += `> [!WARNING]\n> ${warning}\n\n`;
    }
    factcheck += `### Verified Facts\n`;
    if (vFacts.length > 0) {
      factcheck += vFacts.map((f: string) => `- ${f}`).join("\n") + "\n\n";
    } else {
      factcheck += "_No verified facts found._\n\n";
    }
    factcheck += `### Flagged Claims\n`;
    if (fClaims.length > 0) {
      factcheck += fClaims.map((c: string) => `- ${c}`).join("\n") + "\n\n";
    } else {
      factcheck += "_No flagged claims._\n\n";
    }
    factcheck += `### Breakdown\n`;
    if (breakdown.length > 0) {
      factcheck += `| Claim | Verdict | Reason |\n| --- | --- | --- |\n`;
      factcheck += breakdown.map((item: any) => 
        `| ${item.claim || ""} | **${item.verdict || ""}** | ${item.reason || ""} |`
      ).join("\n") + "\n";
    } else {
      factcheck += "_No breakdown available._\n";
    }
  } else {
    factcheck = firstText(factCheckAgent, [
      "factcheck",
      "verification",
      "message",
      "verifiedFacts",
      "claims",
      "summary",
      "content"
    ]);
  }
  const insights = firstText(insightsAgent?.keyInsights ?? insightsAgent, [
    "insights",
    "overallAnalysis",
    "keyInsights",
    "trends",
    "patterns",
    "predictions",
    "recommendations",
    "conclusion",
    "content"
  ]);
  const summary = firstText(summaryAgent, ["summary", "keyInsights", "keyPoints", "conclusion", "content"]);
  const presentation = firstText(presentationAgent, [
    "presentationSummary",
    "presentationTitle",
    "content",
    "outline",
    "slides",
    "recommendations",
    "nextSteps",
    "summary"
  ]);
  const keyInsights = stringArray(
    summaryAgent?.keyInsights ?? insightsAgent?.keyInsights ?? []
  );
  const verifiedFacts = stringArray(factCheckAgent?.verifiedFacts ?? []);
  const completedAt = Date.now();

  if (!research && !factcheck && !insights && !summary && !presentation) {
    throw new Error("The backend returned an empty pipeline response.");
  }

  return {
    topic,
    research,
    factcheck,
    insights,
    summary,
    presentation,
    keyInsights,
    verifiedFacts,
    rawBackendData: data,
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    totalTime: typeof pipeline?.processingTime === "number" ? pipeline.processingTime : (completedAt - startedAt) / 1000,
    trustScore: normalizeTrustScore(
      factCheckAgent?.trustScoreScaled ?? factCheckAgent?.trustScore ?? insightsAgent?.trustScore ?? 0
    )
  };
}

export const swarmApi = {
  health() {
    return requestWithRetry<HealthData>({ method: "GET", url: "/health" });
  },
  research(query: string) {
    return requestWithRetry<ResearchData>({ method: "POST", url: "/api/research", data: { query } satisfies ResearchRequest });
  },
  summarize(rawText: string) {
    return requestWithRetry<SummaryData>({ method: "POST", url: "/api/summarize", data: { rawText } satisfies SummarizeRequest });
  },
  factcheck(claim: string, context: string) {
    return requestWithRetry<FactCheckData>({
      method: "POST",
      url: "/api/factcheck",
      data: { claim, context } satisfies FactCheckRequest
    });
  },
  insights(data: InsightsRequest) {
    return requestWithRetry<InsightsData>({ method: "POST", url: "/api/insights", data });
  },
  pipeline(query: string) {
    return requestWithRetry<PipelineData>({ method: "POST", url: "/api/pipeline", data: { query } satisfies PipelineRequest });
  }
};
