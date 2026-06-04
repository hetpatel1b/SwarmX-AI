import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  ExternalLink,
  FileSearch,
  Gauge,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp
} from "lucide-react";
import type {
  ClaimReview,
  ClaimVerdict,
  EvidenceItem,
  KeyFinding,
  ReportSource,
  StrategicItem,
  StructuredReport
} from "@/types/report";
import { cn } from "@/lib/utils";

const verdictStyle: Record<ClaimVerdict, { label: string; icon: typeof CheckCircle2; className: string }> = {
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    className: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300"
  },
  contradicted: {
    label: "Contradicted",
    icon: ShieldAlert,
    className: "border-red-500/20 bg-red-500/[0.08] text-red-300"
  },
  unverified: {
    label: "Unverified",
    icon: CircleHelp,
    className: "border-amber-500/20 bg-amber-500/[0.08] text-amber-300"
  }
};

function ScoreBadge({ label, value, suffix = "%" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-white">
        {value}
        {suffix}
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description
}: {
  icon: typeof FileSearch;
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-cyan-300">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p>}
        <h2 className="font-display text-xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/[0.08] bg-slate-950/55 p-5", className)}>{children}</div>;
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
      </div>
      <span className="font-mono text-xs text-slate-300">{value}%</span>
    </div>
  );
}

function SourceRefs({ sourceIds, sources }: { sourceIds: string[]; sources: ReportSource[] }) {
  const refs = sourceIds
    .map((id) => sources.find((source) => source.id === id))
    .filter((source): source is ReportSource => Boolean(source));

  if (refs.length === 0) {
    return <span className="text-xs text-slate-600">No source mapped</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {refs.map((source) => (
        <span
          key={source.id}
          className="inline-flex items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[11px] text-slate-300"
        >
          {source.domain ?? source.title}
        </span>
      ))}
    </div>
  );
}

function FindingCard({ finding, sources }: { finding: KeyFinding; sources: ReportSource[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-5 text-white">{finding.title}</h3>
        <ConfidenceBar value={finding.confidence} />
      </div>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-400">{finding.detail}</p>
      <div className="mt-4">
        <SourceRefs sourceIds={finding.sourceIds} sources={sources} />
      </div>
    </motion.div>
  );
}

function EvidenceTable({ evidence, sources }: { evidence: EvidenceItem[]; sources: ReportSource[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Claim</th>
              <th className="px-4 py-3 font-semibold">Evidence</th>
              <th className="px-4 py-3 font-semibold">Sources</th>
              <th className="px-4 py-3 font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {evidence.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="max-w-[220px] px-4 py-4 font-medium text-white">{item.claim}</td>
                <td className="max-w-[360px] px-4 py-4 leading-6 text-slate-400">{item.evidence}</td>
                <td className="px-4 py-4">
                  <SourceRefs sourceIds={item.sourceIds} sources={sources} />
                </td>
                <td className="px-4 py-4">
                  <ConfidenceBar value={item.confidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourceCard({ source }: { source: ReportSource }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{source.title}</p>
          <p className="mt-1 text-xs text-slate-500">{source.domain ?? "Internal source mapping"}</p>
        </div>
        <span className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400">
          {source.type}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <ConfidenceBar value={source.reliability} />
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function VerdictPill({ verdict }: { verdict: ClaimVerdict }) {
  const style = verdictStyle[verdict];
  const Icon = style.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", style.className)}>
      <Icon className="h-3.5 w-3.5" />
      {style.label}
    </span>
  );
}

function ClaimCard({ claim, sources }: { claim: ClaimReview; sources: ReportSource[] }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <VerdictPill verdict={claim.verdict} />
        <ConfidenceBar value={claim.confidence} />
      </div>
      <p className="mt-3 text-sm font-semibold leading-5 text-white">{claim.claim}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{claim.rationale}</p>
      <div className="mt-4">
        <SourceRefs sourceIds={claim.sourceIds} sources={sources} />
      </div>
    </div>
  );
}

function VerificationMatrix({ claims, sources }: { claims: ClaimReview[]; sources: ReportSource[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Claim</th>
              <th className="px-4 py-3 font-semibold">Verdict</th>
              <th className="px-4 py-3 font-semibold">Rationale</th>
              <th className="px-4 py-3 font-semibold">Sources</th>
              <th className="px-4 py-3 font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {claims.map((claim) => (
              <tr key={claim.id} className="align-top">
                <td className="max-w-[240px] px-4 py-4 font-medium text-white">{claim.claim}</td>
                <td className="px-4 py-4">
                  <VerdictPill verdict={claim.verdict} />
                </td>
                <td className="max-w-[320px] px-4 py-4 leading-6 text-slate-400">{claim.rationale}</td>
                <td className="px-4 py-4">
                  <SourceRefs sourceIds={claim.sourceIds} sources={sources} />
                </td>
                <td className="px-4 py-4">
                  <ConfidenceBar value={claim.confidence} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StrategicCard({
  item,
  variant
}: {
  item: StrategicItem;
  variant: "opportunity" | "risk" | "recommendation";
}) {
  const color =
    variant === "opportunity"
      ? "text-emerald-300"
      : variant === "risk"
      ? "text-red-300"
      : "text-cyan-300";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("text-[11px] font-semibold uppercase tracking-wider", color)}>{item.priority} priority</span>
        <span className="font-mono text-xs text-slate-400">{item.confidence}%</span>
      </div>
      <h3 className="mt-2 text-sm font-semibold leading-5 text-white">{item.title}</h3>
      <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-400">{item.detail}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-white/[0.04] px-3 py-2">
          <p className="text-slate-500">Impact</p>
          <p className="mt-1 font-mono text-white">{item.impact}/5</p>
        </div>
        <div className="rounded-lg bg-white/[0.04] px-3 py-2">
          <p className="text-slate-500">Effort</p>
          <p className="mt-1 font-mono text-white">{item.effort}/5</p>
        </div>
      </div>
    </div>
  );
}

function PriorityMatrix({ items }: { items: StrategicItem[] }) {
  const quadrants = [
    {
      label: "Do now",
      hint: "High impact, lower effort",
      items: items.filter((item) => item.impact >= 4 && item.effort <= 3)
    },
    {
      label: "Plan",
      hint: "High impact, higher effort",
      items: items.filter((item) => item.impact >= 4 && item.effort > 3)
    },
    {
      label: "Monitor",
      hint: "Lower impact, lower effort",
      items: items.filter((item) => item.impact < 4 && item.effort <= 3)
    },
    {
      label: "Defer",
      hint: "Lower impact, higher effort",
      items: items.filter((item) => item.impact < 4 && item.effort > 3)
    }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {quadrants.map((quadrant) => (
        <div key={quadrant.label} className="min-h-[140px] rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-white">{quadrant.label}</p>
            <p className="text-[11px] text-slate-500">{quadrant.hint}</p>
          </div>
          <div className="mt-3 space-y-2">
            {quadrant.items.length > 0 ? (
              quadrant.items.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
                  {item.title}
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-white/[0.08] px-3 py-4 text-center text-xs text-slate-600">
                No items in this quadrant
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ResearchSection({ report }: { report: StructuredReport }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileSearch}
        eyebrow="Structured intelligence report"
        title="Research"
        description="Answer-first research with findings, evidence, sources, and confidence indicators."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <ScoreBadge label="Research Confidence" value={report.researchConfidence} />
        <ScoreBadge label="Citation Coverage" value={report.citationCoverage} />
        <ScoreBadge label="Mapped Sources" value={report.sources.length} suffix="" />
      </div>

      <Panel>
        <div className="mb-3 flex items-center gap-2 text-cyan-300">
          <Target className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-wider">Executive Answer</p>
        </div>
        <p className="text-base leading-8 text-slate-200">{report.executiveAnswer}</p>
      </Panel>

      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-white">Key Findings</h3>
        <div className="grid gap-3 lg:grid-cols-2">
          {report.keyFindings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} sources={report.sources} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-white">Evidence Table</h3>
        <EvidenceTable evidence={report.evidence} sources={report.sources} />
      </div>

      <div>
        <h3 className="mb-3 font-display text-base font-semibold text-white">Sources</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {report.sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FactCheckSection({ report }: { report: StructuredReport }) {
  const grouped = {
    verified: report.claims.filter((claim) => claim.verdict === "verified"),
    contradicted: report.claims.filter((claim) => claim.verdict === "contradicted"),
    unverified: report.claims.filter((claim) => claim.verdict === "unverified")
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={ClipboardCheck}
        eyebrow="Evidence review"
        title="Fact Check"
        description="Claim-level verdicts with rationale, mapped evidence, and confidence."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <ScoreBadge label="Verified Claims" value={grouped.verified.length} suffix="" />
        <ScoreBadge label="Contradicted" value={grouped.contradicted.length} suffix="" />
        <ScoreBadge label="Unverified" value={grouped.unverified.length} suffix="" />
      </div>

      <Panel>
        <h3 className="mb-4 font-display text-base font-semibold text-white">Verification Matrix</h3>
        <VerificationMatrix claims={report.claims} sources={report.sources} />
      </Panel>

      {([
        ["Verified Claims", grouped.verified, ShieldCheck],
        ["Contradicted Claims", grouped.contradicted, AlertTriangle],
        ["Unverified Claims", grouped.unverified, CircleHelp]
      ] as const).map(([title, claims, Icon]) => (
        <div key={title}>
          <div className="mb-3 flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <h3 className="font-display text-base font-semibold text-white">{title}</h3>
          </div>
          {claims.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {claims.map((claim) => (
                <ClaimCard key={claim.id} claim={claim} sources={report.sources} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/[0.08] p-5 text-sm text-slate-500">
              No claims in this category.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function InsightsSection({ report }: { report: StructuredReport }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Lightbulb}
        eyebrow="Decision intelligence"
        title="Insights"
        description="Opportunities, risks, recommendations, and prioritization for action."
      />

      <Panel>
        <h3 className="mb-3 font-display text-base font-semibold text-white">Key Takeaways</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {report.keyTakeaways.map((takeaway, index) => (
            <div key={`${takeaway}-${index}`} className="flex gap-3 rounded-xl bg-white/[0.03] p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-xs font-bold text-cyan-300">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-slate-300">{takeaway}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-300" />
            <h3 className="font-display text-base font-semibold text-white">Opportunities</h3>
          </div>
          <div className="grid gap-3">
            {report.opportunities.map((item) => (
              <StrategicCard key={item.id} item={item} variant="opportunity" />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-300" />
            <h3 className="font-display text-base font-semibold text-white">Risks</h3>
          </div>
          <div className="grid gap-3">
            {report.risks.map((item) => (
              <StrategicCard key={item.id} item={item} variant="risk" />
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-cyan-300" />
          <h3 className="font-display text-base font-semibold text-white">Strategic Recommendations</h3>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {report.recommendations.map((item) => (
            <StrategicCard key={item.id} item={item} variant="recommendation" />
          ))}
        </div>
      </div>

      <Panel>
        <h3 className="mb-4 font-display text-base font-semibold text-white">Priority Matrix</h3>
        <PriorityMatrix items={report.recommendations} />
      </Panel>
    </div>
  );
}

export function SummarySection({ report }: { report: StructuredReport }) {
  return (
    <div className="space-y-6">
      <SectionHeader
        icon={ListChecks}
        eyebrow="Executive decision memo"
        title="Summary"
        description="A concise brief focused on what matters, what to do, and where risk remains."
      />

      <Panel>
        <div className="mb-3 flex items-center gap-2 text-cyan-300">
          <Gauge className="h-4 w-4" />
          <p className="text-[11px] font-semibold uppercase tracking-wider">Executive Summary</p>
        </div>
        <p className="text-base leading-8 text-slate-200">{report.summary.executiveSummary}</p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel>
          <h3 className="mb-3 font-display text-base font-semibold text-white">What Matters Most</h3>
          <div className="space-y-2">
            {report.summary.mattersMost.map((item, index) => (
              <div key={`${item}-${index}`} className="flex gap-3 rounded-xl bg-white/[0.03] p-3">
                <span className="font-mono text-xs text-cyan-300">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h3 className="mb-3 font-display text-base font-semibold text-white">Recommended Actions</h3>
          <div className="overflow-hidden rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {report.summary.recommendedActions.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-white">{item.title}</td>
                    <td className="px-4 py-4 text-slate-300">{item.priority}</td>
                    <td className="px-4 py-4">
                      <ConfidenceBar value={item.confidence} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-display text-base font-semibold text-white">Risk Areas</h3>
          <div className="grid gap-3">
            {report.summary.riskAreas.map((item) => (
              <StrategicCard key={item.id} item={item} variant="risk" />
            ))}
          </div>
        </div>

        <Panel>
          <h3 className="mb-3 font-display text-base font-semibold text-white">Next Steps</h3>
          <div className="space-y-2">
            {report.summary.nextSteps.map((item, index) => (
              <div key={`${item}-${index}`} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                <p className="text-sm leading-6 text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
