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
  const pipeline = data.pipeline ?? data;
  const factCheckData = pipeline.factcheck ?? pipeline.factCheck;
  const research = firstText(pipeline.research ?? pipeline.report ?? pipeline.rawText, ["report", "research", "rawText", "content", "text"]);
  const factcheck = firstText(factCheckData, [
    "factcheck",
    "verification",
    "message",
    "verifiedFacts",
    "claims",
    "summary",
    "content"
  ]);
  const insights = firstText(pipeline.insights ?? pipeline.keyInsights, [
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
  const summary = firstText(pipeline.summary, ["summary", "keyInsights", "keyPoints", "conclusion", "content"]);
  const presentation = firstText(pipeline.presentation, [
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
    pipeline.keyInsights ?? valueFromRecord(pipeline.summary, "keyInsights") ?? valueFromRecord(pipeline.insights, "keyInsights")
  );
  const verifiedFacts = stringArray(pipeline.verifiedFacts ?? valueFromRecord(factCheckData, "verifiedFacts"));
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
    totalTime: typeof pipeline.processingTime === "number" ? pipeline.processingTime : (completedAt - startedAt) / 1000,
    trustScore: normalizeTrustScore(
      pipeline.trustScore ?? valueFromRecord(factCheckData, "trustScore") ?? valueFromRecord(pipeline.insights, "trustScore")
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
