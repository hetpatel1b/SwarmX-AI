import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Copy,
  Check,
  FileSearch,
  Shield,
  Sparkles,
  AlertCircle
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

export function ResultsExplorerPage() {
  const [active, setActive] = useState("Research");
  const [copied, setCopied] = useState(false);
  const results = useSwarmStore((state) => state.results);
  const content: Record<string, string> = {
    Research: results?.research ?? "",
    "Fact Check": results?.factcheck ?? "",
    Insights: results?.insights ?? "",
    Summary: results?.summary ?? ""
  };

  const meta = tabMeta[active];
  const currentContent = content[active];

  const copyToClipboard = async () => {
    if (!currentContent) return;
    await navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

          {/* Topic + Trust badges */}
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
                {results.trustScore}% Trust
              </motion.span>
            )}
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
          </div>
        </div>
        <Tabs
          tabs={Object.keys(content)}
          active={active}
          onChange={setActive}
        />
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
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
