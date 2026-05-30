import { motion } from "framer-motion";
import {
  Download,
  FileDown,
  MonitorPlay,
  Presentation,
  Sparkles
} from "lucide-react";
import { MarkdownCard } from "@/components/results/MarkdownCard";
import { Button } from "@/components/ui/button";
import { features } from "@/config/env";
import { useSwarmStore } from "@/store/swarmStore";

export function PresentationBuilderPage() {
  const results = useSwarmStore((state) => state.results);
  const slidePreview = results
    ? [
        results.presentation,
        results.summary && `## Summary\n\n${results.summary}`,
        results.insights && `## Insights\n\n${results.insights}`,
        results.factcheck && `## Verified Facts\n\n${results.factcheck}`
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";

  const exportPdf = async () => {
    if (!results) return;
    const { exportResultsPdf } = await import("@/utils/exporters");
    exportResultsPdf(results);
  };
  const exportPpt = async () => {
    if (!results) return;
    const { exportResultsPpt } = await import("@/utils/exporters");
    await exportResultsPpt(results);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
          <MonitorPlay className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Executive Studio
          </h1>
          <p className="text-sm text-slate-400">
            Boardroom-ready presentation assets from the latest swarm output
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />

          <div className="space-y-2 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Presentation className="h-4 w-4 text-rose-400" />
              <h2 className="font-display text-base font-semibold text-white">
                Export Controls
              </h2>
            </div>

            {/* Export cards */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => void exportPdf()}
              disabled={!results || !features.exports}
              className="group w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-all hover:border-cyan-500/20 hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-colors group-hover:bg-cyan-500/20">
                  <FileDown className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-white">Export PDF</p>
                  <p className="text-xs text-slate-400">
                    Research brief document
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => void exportPpt()}
              disabled={!results || !features.exports}
              className="group w-full rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-all hover:border-violet-500/20 hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
                  <Download className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-white">Export PowerPoint</p>
                  <p className="text-xs text-slate-400">
                    Slide deck with all sections
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Info panel */}
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-slate-400">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Export Info
                </span>
              </div>
              Exports use only the latest backend response, including topic
              metadata, trust score, and generated sections.
            </div>

            {!features.exports && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 text-sm text-amber-200">
                Exports are disabled by VITE_ENABLE_EXPORTS.
              </div>
            )}
          </div>
        </motion.div>

        {/* Slide preview */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <MarkdownCard
            title="Slide Narrative"
            content={slidePreview}
            icon={Presentation}
          />
        </motion.div>
      </div>
    </div>
  );
}
