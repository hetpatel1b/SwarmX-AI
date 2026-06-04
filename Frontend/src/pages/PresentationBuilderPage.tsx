import React, { useMemo, useCallback, memo, useState, Component, ErrorInfo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Download,
  FileDown,
  Lightbulb,
  MonitorPlay,
  Presentation,
  Shield,
  Sparkles,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { MarkdownCard } from "@/components/results/MarkdownCard";
import { features } from "@/config/env";
import { useSwarmStore } from "@/store/swarmStore";
import { wordCount } from "@/utils/format";

// Safe word count that handles undefined/null/empty
function safeWordCount(text: string | undefined | null): number {
  if (!text || typeof text !== "string") return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

import { parsePresentationJson } from "@/utils/slideParser";
import type { Slide } from "@/utils/slideParser";

class PresentationErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Presentation rendering error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center glass-panel rounded-2xl border border-red-500/20 bg-red-500/5">
          <Presentation className="h-10 w-10 text-red-500/70" />
          <div>
            <p className="text-sm font-medium text-slate-300">Something went wrong rendering the slides</p>
            <p className="mt-1 text-xs text-red-400/80">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function PresentationBuilderPage() {
  const results = useSwarmStore((state) => state.results);

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const rawData = results?.rawBackendData as any;
  const payload = rawData?.pipeline?.presentation || rawData?.presentation || results?.presentation;

  const presentationData = parsePresentationJson(payload);
  const slides = presentationData.slides;

  console.log("Presentation Raw:", payload);
  console.log("Normalized Slides:", slides);

  const renderSlidesSection = () => {
    if (!results) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center glass-panel rounded-2xl">
          <Presentation className="h-10 w-10 text-slate-600" />
          <div>
            <p className="text-sm font-medium text-slate-400">No slides available yet</p>
            <p className="mt-1 text-xs text-slate-500">Run the swarm to generate a presentation deck</p>
          </div>
        </div>
      );
    }

    if (slides.length === 0) {
      // Fallback UI: show "Generating slides..." skeleton loader
      return (
        <div className="space-y-4 p-6 glass-panel rounded-2xl animate-pulse">
          <div className="h-6 w-1/4 rounded bg-white/10" />
          <div className="h-4 w-3/4 rounded bg-white/5" />
          <div className="space-y-3 mt-6">
            <div className="h-3 w-5/6 rounded bg-white/5" />
            <div className="h-3 w-4/5 rounded bg-white/5" />
            <div className="h-3 w-2/3 rounded bg-white/5" />
          </div>
          <div className="mt-8 flex items-center justify-between text-xs text-slate-500">
            <span>Generating slides...</span>
            <div className="h-2 w-12 rounded bg-white/10" />
          </div>
        </div>
      );
    }

    // Safely get active slide
    const activeSlide = slides[currentSlideIndex] || slides[0];
    if (!activeSlide) return null;

    return (
      <div className="space-y-6">
        {/* Interactive Slide Box */}
        <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/40 p-6 sm:p-8 min-h-[300px] flex flex-col justify-between">
          {/* Slide Header */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-md">
                Slide {activeSlide.slideNumber || (currentSlideIndex + 1)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>
            
            <h2 className="font-display text-2xl font-bold text-white mb-6">
              {activeSlide.title || "Untitled Slide"}
            </h2>

            {/* Slide Bullets */}
            <ul className="space-y-3 list-disc list-inside text-sm text-slate-300">
              {Array.isArray(activeSlide.bullets) && activeSlide.bullets.map((bullet: string, index: number) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="leading-relaxed pl-1"
                >
                  {bullet}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Slide Navigation Controls */}
          <div className="mt-8 pt-5 border-t border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-slate-400 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            {/* Dots */}
            <div className="hidden sm:flex gap-1.5">
              {slides.map((_: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex ? "w-4 bg-rose-400" : "w-1.5 bg-white/10 hover:bg-white/20"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Speaker Notes Card */}
        {activeSlide.speakerNotes && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-5 rounded-2xl border-white/[0.04] bg-white/[0.01]"
          >
            <div className="flex items-center gap-2 mb-2 text-rose-400/80">
              <FileText className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Speaker Notes
              </span>
            </div>
            <p className="text-sm text-slate-400 italic leading-relaxed">
              {activeSlide.speakerNotes}
            </p>
          </motion.div>
        )}
      </div>
    );
  };



  const slidePreview = useMemo(() => {
    if (!results) return "";
    return [
      results.presentation || "",
      results.summary ? `## Summary\n\n${results.summary}` : "",
      results.insights ? `## Insights\n\n${results.insights}` : "",
      results.factcheck ? `## Verified Facts\n\n${results.factcheck}` : ""
    ]
      .filter((s) => s.length > 0)
      .join("\n\n");
  }, [results]);

  const exportPdf = useCallback(async () => {
    if (!results) return;
    const { exportResultsPdf } = await import("@/utils/exporters");
    exportResultsPdf(results);
  }, [results]);

  const exportPpt = useCallback(async () => {
    if (!results) return;
    const { exportResultsPpt } = await import("@/utils/exporters");
    await exportResultsPpt(results);
  }, [results]);

  const sectionCards = useMemo(() => {
    if (!results) return [];
    return [
      { label: "Presentation", words: safeWordCount(results.presentation), icon: Presentation, color: "text-rose-400" },
      { label: "Summary", words: safeWordCount(results.summary), icon: FileText, color: "text-amber-400" },
      { label: "Insights", words: safeWordCount(results.insights), icon: Lightbulb, color: "text-violet-400" },
      { label: "Verified", words: safeWordCount(results.factcheck), icon: Shield, color: "text-emerald-400" }
    ];
  }, [results]);

  const totalWords = useMemo(() => sectionCards.reduce((sum, s) => sum + s.words, 0), [sectionCards]);

  // Readiness score (0-100) based on which sections have content
  const readiness = useMemo(() => {
    if (!results) return 0;
    const checks = [
      (results.presentation?.length ?? 0) > 20,
      (results.summary?.length ?? 0) > 20,
      (results.insights?.length ?? 0) > 20,
      (results.factcheck?.length ?? 0) > 20
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [results]);

  const exportCards = useMemo(() => [
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
  ], [exportPdf, exportPpt]);

  return (
    <PresentationErrorBoundary>
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
              {results ? "Boardroom-ready deliverables from the latest mission" : "Complete a swarm mission to generate deliverables"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-300"
            >
              <Shield className="h-3 w-3" />
              {results.trustScore ?? 0}% Trust
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Readiness + Section stats */}
      {results ? (
        <div className="grid gap-3 sm:grid-cols-5">
          {/* Readiness indicator */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-xl p-4"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <svg width={40} height={40} className="-rotate-90">
                  <circle cx={20} cy={20} r={16} fill="none" stroke="rgba(148,163,184,0.08)" strokeWidth={3} />
                  <circle
                    cx={20} cy={20} r={16} fill="none"
                    stroke={readiness >= 75 ? "#10b981" : readiness >= 50 ? "#f59e0b" : "#f43f5e"}
                    strokeWidth={3} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - readiness / 100)}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute font-mono text-[10px] font-bold text-white">{readiness}%</span>
              </div>
              <div>
                <p className="text-xs text-slate-400">Readiness</p>
                <p className="text-sm font-semibold text-white">{totalWords} <span className="text-slate-500 text-[10px]">words</span></p>
              </div>
            </div>
          </motion.div>

          {sectionCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.05 }}
                className="glass-panel rounded-xl p-4"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                  <div>
                    <p className="text-xs text-slate-400">{s.label}</p>
                    <p className="font-mono text-sm font-semibold text-white">
                      {s.words > 0 ? s.words : "—"} {s.words > 0 && <span className="text-slate-500 text-[10px]">words</span>}
                    </p>
                  </div>
                  {s.words > 0 && <CheckCircle className="ml-auto h-3 w-3 text-emerald-400/60" />}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty state when no results */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-8"
        >
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <MonitorPlay className="h-7 w-7 text-slate-600" />
              <div className="absolute -inset-4 rounded-3xl border border-dashed border-white/[0.04]" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-slate-400">No presentation data</p>
              <p className="mt-1 text-xs text-slate-500">Run a swarm mission first to generate exportable content</p>
            </div>
          </div>
        </motion.div>
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

            {/* Export quality */}
            {results && (
              <div className="rounded-xl border border-white/[0.05] bg-black/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    Export Quality
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Content Coverage", value: readiness, color: readiness >= 75 ? "bg-emerald-400" : "bg-amber-400" },
                    { label: "Trust Score", value: results.trustScore ?? 0, color: "bg-cyan-400" }
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>{m.label}</span>
                        <span className="font-mono">{m.value}%</span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-white/[0.06]">
                        <div
                          className={`h-full rounded-full ${m.color} transition-all duration-700`}
                          style={{ width: `${Math.min(100, m.value)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!results && (
              <div className="rounded-xl border border-white/[0.05] bg-black/20 p-4 text-[13px] leading-relaxed text-slate-400">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    Getting Started
                  </span>
                </div>
                Navigate to the Workspace and run a research mission. All sections will populate automatically.
              </div>
            )}

            {!features.exports && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3 text-xs text-amber-300">
                Exports are disabled via configuration.
              </div>
            )}
          </div>
        </motion.div>

        {/* Slide preview / Visual Deck Viewer */}
        <div className="space-y-6">
          {renderSlidesSection()}
          <MarkdownCard
            title="Slide Narrative"
            content={slidePreview}
            icon={Presentation}
          />
        </div>
      </div>
    </div>
    </PresentationErrorBoundary>
  );
}
