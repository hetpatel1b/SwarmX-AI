import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileSearch, Shield, Sparkles } from "lucide-react";
import { MarkdownCard } from "@/components/results/MarkdownCard";
import { Tabs } from "@/components/ui/tabs";
import { useSwarmStore } from "@/store/swarmStore";

const tabIcons: Record<string, typeof BookOpen> = {
  Research: BookOpen,
  "Fact Check": Shield,
  Insights: Sparkles,
  Summary: FileSearch
};

export function ResultsExplorerPage() {
  const [active, setActive] = useState("Research");
  const results = useSwarmStore((state) => state.results);
  const content: Record<string, string> = {
    Research: results?.research ?? "",
    "Fact Check": results?.factcheck ?? "",
    Insights: results?.insights ?? "",
    Summary: results?.summary ?? ""
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <BookOpen className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Knowledge Center
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {results?.topic ??
                  "Run the swarm to populate intelligence outputs."}
              </p>
            </div>
          </div>

          {/* Trust badge */}
          {results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-3 py-1 text-xs font-semibold text-emerald-300"
            >
              <Shield className="h-3 w-3" />
              Trust Score: {results.trustScore}%
            </motion.div>
          )}
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
            content={content[active]}
            icon={tabIcons[active]}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
