import { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  FileSearch,
  Shield,
  Sparkles,
  AlertCircle,
  Maximize2,
  Minimize2
} from "lucide-react";
import { MarkdownCard } from "@/components/results/MarkdownCard";
import { Tabs } from "@/components/ui/tabs";
import { useSwarmStore } from "@/store/swarmStore";
import { cn } from "@/lib/utils";

const tabMeta: Record<string, { icon: typeof BookOpen; color: string; bg: string; description: string }> = {
  Research: {
    icon: BookOpen,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    description: "Deep research findings from autonomous source analysis"
  },
  "Fact Check": {
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    description: "Cross-validated claims with evidence scoring"
  },
  Insights: {
    icon: Sparkles,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    description: "Pattern detection and strategic recommendations"
  },
  Summary: {
    icon: FileSearch,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    description: "Executive synthesis of all agent outputs"
  }
};

function safeWordCount(text?: string | null): number {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Confidence badge based on word count
function ConfidenceBadge({ words }: { words: number }) {
  const level = words > 200 ? "High" : words > 50 ? "Medium" : words > 0 ? "Low" : "None";
  const colors = {
    High: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300",
    Medium: "border-amber-500/20 bg-amber-500/[0.06] text-amber-300",
    Low: "border-slate-500/20 bg-slate-500/[0.06] text-slate-300",
    None: "border-white/[0.06] bg-white/[0.02] text-slate-500"
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", colors[level])}>
      <span className={cn(
        "h-1 w-1 rounded-full",
        level === "High" ? "bg-emerald-400" : level === "Medium" ? "bg-amber-400" : "bg-slate-500"
      )} />
      {level} Depth
    </span>
  );
}

export function ResultsExplorerPage() {
  const [active, setActive] = useState("Research");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const results = useSwarmStore((state) => state.results);

  const content = useMemo<Record<string, string>>(() => ({
    Research: results?.research ?? "",
    "Fact Check": results?.factcheck ?? "",
    Insights: results?.insights ?? "",
    Summary: results?.summary ?? ""
  }), [results]);

  const meta = tabMeta[active];
  const currentContent = content[active] ?? "";
  const currentWords = safeWordCount(currentContent);

  const copyToClipboard = useCallback(async () => {
    if (!currentContent) return;
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  }, [currentContent]);

  // Animated trust bar
  const trustScore = results?.trustScore ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", meta.bg, meta.color)}>
              <meta.icon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Intelligence Center
              </h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={active}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-1 text-sm text-slate-400"
                >
                  {meta.description}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Badges row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {results?.topic && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-slate-300">
                <AlertCircle className="h-3 w-3 text-slate-500" />
                {results.topic}
              </span>
            )}
            {results && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 text-xs font-semibold text-emerald-300"
              >
                <Shield className="h-3 w-3" />
                {trustScore}% Trust
              </motion.span>
            )}
            <ConfidenceBadge words={currentWords} />
            {currentContent && (
              <button
                type="button"
                onClick={() => void copyToClipboard()}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-slate-400 transition-all hover:border-cyan-500/20 hover:text-cyan-300"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs text-slate-400 transition-all hover:border-cyan-500/20 hover:text-cyan-300"
            >
              {expanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              {expanded ? "Compact" : "Expand"}
            </button>
          </div>
        </div>
        <Tabs
          tabs={Object.keys(content)}
          active={active}
          onChange={setActive}
        />
      </motion.div>

      {/* Trust indicator bar */}
      {results && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="glass-panel rounded-xl p-4"
          style={{ transformOrigin: "left" }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Source Trust Assessment</span>
            </div>
            <span className="font-mono text-xs font-bold text-white">{trustScore}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/[0.06]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, trustScore)}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "h-full rounded-full",
                trustScore >= 70 ? "bg-gradient-to-r from-emerald-400 to-cyan-400" :
                trustScore >= 40 ? "bg-gradient-to-r from-amber-400 to-yellow-400" :
                "bg-gradient-to-r from-red-400 to-rose-400"
              )}
            />
          </div>
          <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
            {(results.verifiedFacts?.length ?? 0) > 0 && (
              <span>{results.verifiedFacts.length} verified facts</span>
            )}
            {(results.keyInsights?.length ?? 0) > 0 && (
              <span>· {results.keyInsights.length} key insights</span>
            )}
            {currentWords > 0 && (
              <span>· {currentWords} words in {active}</span>
            )}
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className={expanded ? "max-h-none" : ""}
        >
          <MarkdownCard
            title={active}
            content={currentContent}
            icon={meta.icon}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
