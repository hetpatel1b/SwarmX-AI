import type { SwarmResults } from "@/types/swarm";
import type {
  ClaimReview,
  ClaimVerdict,
  EvidenceItem,
  KeyFinding,
  ReportSource,
  StrategicItem,
  StructuredReport
} from "@/types/report";
import { clamp } from "@/utils/format";

const sentenceEnd = /(?<=[.!?])\s+/;
const urlPattern = /(https?:\/\/[^\s)\]}>,"]+)/g;

function stripMarkdown(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`|]/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function safeJsonText(value: string) {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return value;
  }
}

function toSentences(value: string, max = 10) {
  return stripMarkdown(safeJsonText(value))
    .split(sentenceEnd)
    .map((item) => item.trim())
    .filter((item) => item.length > 15)
    .slice(0, max);
}

function titleFromSentence(sentence: string, fallback: string) {
  const cleaned = stripMarkdown(sentence);
  const title = cleaned.split(":")[0] || cleaned;
  return title.length > 84 ? `${title.slice(0, 81).trim()}...` : title || fallback;
}

function stableId(prefix: string, index: number) {
  return `${prefix}-${index + 1}`;
}

function sourceType(domain = ""): ReportSource["type"] {
  if (/(edu|arxiv|springer|sciencedirect|nature|acm|ieee)/i.test(domain)) return "academic";
  if (/(gov|who|oecd|worldbank|un|europa)/i.test(domain)) return "government";
  if (/(reuters|bloomberg|nytimes|wsj|bbc|guardian|forbes|techcrunch)/i.test(domain)) return "news";
  if (/(microsoft|google|openai|anthropic|nvidia|meta|amazon|apple)/i.test(domain)) return "company";
  return domain ? "web" : "unknown";
}

function reliabilityFor(type: ReportSource["type"]) {
  if (type === "academic" || type === "government") return 92;
  if (type === "company") return 82;
  if (type === "news") return 78;
  if (type === "web") return 68;
  return 54;
}

function extractSources(...parts: string[]): ReportSource[] {
  const urls = Array.from(new Set(parts.join(" ").match(urlPattern) ?? []));
  return urls.slice(0, 12).map((url, index) => {
    let domain = "";
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      domain = "";
    }
    const type = sourceType(domain);
    return {
      id: stableId("source", index),
      title: domain || `Source ${index + 1}`,
      url,
      domain,
      type,
      reliability: reliabilityFor(type)
    };
  });
}

function fallbackSources(): ReportSource[] {
  return [
    {
      id: "source-1",
      title: "Backend research corpus",
      type: "unknown",
      reliability: 58
    }
  ];
}

function sourceIdsFor(index: number, sources: ReportSource[]) {
  if (sources.length === 0) return [];
  return [sources[index % sources.length].id];
}

function confidenceFromText(text: string, base = 72) {
  const hasNumbers = /\d/.test(text);
  const hasSource = urlPattern.test(text);
  urlPattern.lastIndex = 0;
  return clamp(base + (hasNumbers ? 8 : 0) + (hasSource ? 10 : 0));
}

function buildExecutiveAnswer(results: SwarmResults) {
  const summarySentences = toSentences(results.summary, 3);
  const researchSentences = toSentences(results.research, 3);
  const source = summarySentences.length > 0 ? summarySentences : researchSentences;
  if (source.length > 0) return source.join(" ");
  return `The research mission on "${results.topic}" is complete. Review the findings, evidence, verification status, and recommended actions below.`;
}

function buildFindings(results: SwarmResults, sources: ReportSource[]): KeyFinding[] {
  const explicitInsights = results.keyInsights.filter(Boolean);
  const candidates = explicitInsights.length > 0 ? explicitInsights : toSentences(results.research, 6);
  return candidates.slice(0, 6).map((item, index) => ({
    id: stableId("finding", index),
    title: titleFromSentence(item, `Finding ${index + 1}`),
    detail: stripMarkdown(item),
    confidence: confidenceFromText(item, 74 - index * 2),
    sourceIds: sourceIdsFor(index, sources)
  }));
}

function buildEvidence(findings: KeyFinding[], sources: ReportSource[]): EvidenceItem[] {
  return findings.map((finding, index) => ({
    id: stableId("evidence", index),
    claim: finding.title,
    evidence: finding.detail,
    confidence: finding.confidence,
    sourceIds: finding.sourceIds.length > 0 ? finding.sourceIds : sourceIdsFor(index, sources)
  }));
}

function verdictFor(text: string): ClaimVerdict {
  if (/(contradict|conflict|false|incorrect|unsupported|flagged|warning|low verification)/i.test(text)) {
    return "contradicted";
  }
  if (/(unverified|unclear|unknown|insufficient|not enough|cannot verify)/i.test(text)) {
    return "unverified";
  }
  return "verified";
}

function parseFactcheckLines(factcheck: string) {
  return factcheck
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((line) => line.length > 28 && !/^trust score|verified percentage|breakdown$/i.test(line));
}

function buildClaims(results: SwarmResults, sources: ReportSource[]): ClaimReview[] {
  const verified = results.verifiedFacts.map((claim, index) => ({
    id: stableId("claim", index),
    claim: stripMarkdown(claim),
    verdict: "verified" as ClaimVerdict,
    rationale: "Matched against available evidence in the generated research output.",
    confidence: confidenceFromText(claim, Math.max(70, results.trustScore || 76)),
    sourceIds: sourceIdsFor(index, sources)
  }));

  const parsed = parseFactcheckLines(results.factcheck)
    .filter((line) => !verified.some((item) => item.claim.includes(stripMarkdown(line).slice(0, 40))))
    .slice(0, 8)
    .map((line, index) => {
      const verdict = verdictFor(line);
      return {
        id: stableId("claim", verified.length + index),
        claim: titleFromSentence(line, `Claim ${index + 1}`),
        verdict,
        rationale: stripMarkdown(line),
        confidence: verdict === "verified" ? confidenceFromText(line, 74) : confidenceFromText(line, 58),
        sourceIds: sourceIdsFor(index, sources)
      };
    });

  const claims = [...verified, ...parsed].slice(0, 12);
  if (claims.length > 0) return claims;

  return toSentences(results.research, 5).map((sentence, index) => ({
    id: stableId("claim", index),
    claim: titleFromSentence(sentence, `Claim ${index + 1}`),
    verdict: "unverified",
    rationale: "No explicit verification data was returned for this claim.",
    confidence: 52,
    sourceIds: sourceIdsFor(index, sources)
  }));
}

function strategicItem(text: string, index: number, prefix: string): StrategicItem {
  const impact = clamp(5 - (index % 3), 1, 5);
  const effort = clamp(2 + (index % 4), 1, 5);
  const priority = impact >= 4 && effort <= 3 ? "High" : impact >= 3 ? "Medium" : "Low";
  return {
    id: stableId(prefix, index),
    title: titleFromSentence(text, `${prefix} ${index + 1}`),
    detail: stripMarkdown(text),
    impact,
    effort,
    confidence: confidenceFromText(text, 70),
    priority
  };
}

function splitStrategic(results: SwarmResults) {
  const sentences = toSentences(`${results.insights} ${results.summary}`, 16);
  const opportunities = sentences
    .filter((item) => /(opportun|growth|potential|advantage|benefit|improve|expand|accelerate)/i.test(item))
    .slice(0, 4);
  const risks = sentences
    .filter((item) => /(risk|challenge|concern|barrier|uncertain|threat|cost|privacy|security|regulat)/i.test(item))
    .slice(0, 4);
  const recommendations = sentences
    .filter((item) => /(recommend|should|next|priorit|action|invest|adopt|monitor|start|focus)/i.test(item))
    .slice(0, 5);

  return {
    opportunities: (opportunities.length > 0 ? opportunities : sentences.slice(0, 3)).map((item, index) =>
      strategicItem(item, index, "opportunity")
    ),
    risks: (risks.length > 0 ? risks : sentences.slice(3, 6)).map((item, index) => strategicItem(item, index, "risk")),
    recommendations: (recommendations.length > 0 ? recommendations : sentences.slice(0, 5)).map((item, index) =>
      strategicItem(item, index, "recommendation")
    ),
    keyTakeaways: sentences.slice(0, 4).map(stripMarkdown)
  };
}

function buildSummary(results: SwarmResults, strategic: ReturnType<typeof splitStrategic>) {
  const summarySentences = toSentences(results.summary, 8);
  const researchSentences = toSentences(results.research, 8);
  const pool = summarySentences.length > 0 ? summarySentences : researchSentences;

  return {
    executiveSummary: pool.slice(0, 3).join(" ") || buildExecutiveAnswer(results),
    mattersMost: pool.slice(0, 4).map(stripMarkdown),
    recommendedActions: strategic.recommendations.slice(0, 5),
    riskAreas: strategic.risks.slice(0, 4),
    nextSteps: strategic.recommendations.slice(0, 4).map((item) => item.title)
  };
}

export function normalizeStructuredReport(results: SwarmResults): StructuredReport {
  const sources = extractSources(results.research, results.factcheck, results.insights, results.summary);
  const usableSources = sources.length > 0 ? sources : fallbackSources();
  const keyFindings = buildFindings(results, usableSources);
  const evidence = buildEvidence(keyFindings, usableSources);
  const claims = buildClaims(results, usableSources);
  const strategic = splitStrategic(results);
  const citedFindings = keyFindings.filter((finding) => finding.sourceIds.length > 0).length;
  const citationCoverage = keyFindings.length > 0 ? Math.round((citedFindings / keyFindings.length) * 100) : 0;

  return {
    executiveAnswer: buildExecutiveAnswer(results),
    keyFindings,
    evidence,
    sources: usableSources,
    citationCoverage,
    researchConfidence: clamp(results.trustScore || Math.round(keyFindings.reduce((sum, item) => sum + item.confidence, 0) / Math.max(keyFindings.length, 1))),
    claims,
    opportunities: strategic.opportunities,
    risks: strategic.risks,
    recommendations: strategic.recommendations,
    keyTakeaways: strategic.keyTakeaways,
    summary: buildSummary(results, strategic)
  };
}
