import { motion } from "framer-motion";
import {
  Download,
  FileDown,
  MonitorPlay,
  Presentation,
  Sparkles,
  FileText,
  Shield,
  Lightbulb
} from "lucide-react";
import { MarkdownCard } from "@/components/results/MarkdownCard";
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

  const exportCards = [
    {
      label: "Export PDF",
      desc: "Research brief with all findings",
      icon: FileDown,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      hoverBorder: "hover:border-cyan-500/20",
      hoverBg: "hover:bg-cyan-500/[0.04]",
      glow: "group-hover:shadow-[0_0_24px_rgba(6,182,212,0.08)]",
      action: () => void exportPdf()
    },
    {
      label: "Export PowerPoint",
      desc: "Slide deck with all sections",
      icon: Download,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      hoverBorder: "hover:border-violet-500/20",
      hoverBg: "hover:bg-violet-500/[0.04]",
      glow: "group-hover:shadow-[0_0_24px_rgba(139,92,246,0.08)]",
      action: () => void exportPpt()
    }
  ];

  const sectionCards = results ? [
    { label: "Presentation", words: results.presentation.split(/\s+/).length, icon: Presentation, color: "text-rose-400" },
    { label: "Summary", words: results.summary.split(/\s+/).length, icon: FileText, color: "text-amber-400" },
    { label: "Insights", words: results.insights.split(/\s+/).length, icon: Lightbulb, color: "text-violet-400" },
    { label: "Verified", words: results.factcheck.split(/\s+/).length, icon: Shield, color: "text-emerald-400" }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
            <MonitorPlay className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Executive Studio
            </h1>
            <p className="text-sm text-slate-400">
              Boardroom-ready deliverables from the latest mission
            </p>
          </div>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-300"
          >
            <Shield className="h-3 w-3" />
            {results.trustScore}% Trust
          </motion.div>
        )}
      </motion.div>

      {/* Section stats */}
      {sectionCards.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-4">
          {sectionCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel rounded-xl p-4"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  <div>
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <p className="font-mono text-sm font-semibold text-white">{s.words} <span className="text-slate-500 text-[10px]">words</span></p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/40 to-transparent" />

          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Presentation className="h-4 w-4 text-rose-400" />
              <h2 className="font-display text-sm font-semibold text-white">
                Export Formats
              </h2>
            </div>

            {exportCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.label}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={card.action}
                  disabled={!results || !features.exports}
                  className={`group w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all ${card.hoverBorder} ${card.hoverBg} ${card.glow} disabled:opacity-30 disabled:pointer-events-none`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-105`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-medium text-white text-sm">{card.label}</p>
                      <p className="text-xs text-slate-400">{card.desc}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {/* Info panel */}
            <div className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-[13px] leading-relaxed text-slate-400">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  About Exports
                </span>
              </div>
              Exports include all sections from the latest swarm run,
              packaged with topic metadata and trust scoring.
            </div>

            {!features.exports && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 text-xs text-amber-300">
                Exports are disabled via configuration.
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
