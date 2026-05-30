import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Cpu,
  Network,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageKey } from "@/layouts/AppLayout";
import { useSwarmStore } from "@/store/swarmStore";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }
});

const capabilities = [
  {
    icon: Brain,
    label: "Deep Research",
    text: "Autonomous source gathering, synthesis, and comprehensive analysis across knowledge domains.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20"
  },
  {
    icon: ShieldCheck,
    label: "Fact Verification",
    text: "Multi-source claim validation, evidence scoring, and trust signal generation.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  {
    icon: Network,
    label: "Agent Collaboration",
    text: "Observable real-time coordination across five specialized intelligence agents.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20"
  },
  {
    icon: Cpu,
    label: "Smart Presentations",
    text: "Executive summaries and export-ready slide narratives, boardroom-grade.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20"
  }
];

const metrics = [
  { label: "Trust Score", value: "96%", icon: Shield },
  { label: "Agent Accuracy", value: "98.2%", icon: Zap },
  { label: "Research Speed", value: "<30s", icon: Sparkles },
  { label: "Knowledge Coverage", value: "5 Agents", icon: Network }
];

export function LandingPage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const results = useSwarmStore((s) => s.results);

  return (
    <div className="space-y-16 pb-12">
      {/* ─── Hero Section ─── */}
      <section className="relative flex min-h-[calc(100vh-140px)] flex-col items-center justify-center text-center">
        {/* Ambient glow behind hero */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[600px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
          <div className="absolute h-[400px] w-[500px] translate-x-32 rounded-full bg-violet-500/[0.06] blur-[120px]" />
        </div>

        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            Microsoft Build AI Agent Swarms
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeUp(0.1)}
          className="mt-8 font-display text-6xl font-bold leading-[1.1] tracking-tight text-white sm:text-7xl lg:text-8xl"
        >
          <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
            Swarm
          </span>
          <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
            X
          </span>{" "}
          <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
            AI
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...fadeUp(0.2)}
          className="mt-6 max-w-xl font-display text-xl font-medium leading-relaxed text-slate-300 sm:text-2xl"
        >
          <span className="text-white">One AI Thinks.</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
            A Swarm Understands.
          </span>
        </motion.p>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.3)}
          className="mt-4 max-w-lg text-sm leading-7 text-slate-400"
        >
          An autonomous multi-agent intelligence platform where research,
          verification, insight generation, summarization, and presentation
          creation move as one coordinated swarm.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.4)}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" onClick={() => onNavigate("workspace")}>
            Launch Command Center
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onNavigate("agents")}
          >
            View Neural Network
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 flex flex-col items-center gap-2"
        >
          <span className="text-xs tracking-wider text-slate-500">
            Explore
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-6 w-4 rounded-full border border-slate-600 flex items-start justify-center p-1"
          >
            <span className="h-1.5 w-1 rounded-full bg-slate-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Live Metrics ─── */}
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group glass-panel relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:border-white/[0.15]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-medium text-slate-400">
                      {m.label}
                    </p>
                    <p className="font-display text-2xl font-bold tracking-tight text-white">
                      {m.label === "Trust Score" && results
                        ? `${results.trustScore}%`
                        : m.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── Capabilities ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Intelligence Architecture
          </h2>
          <p className="mt-3 text-slate-400">
            Five specialized agents working in concert to deliver comprehensive intelligence.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="group glass-panel relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:border-white/[0.15]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex gap-4">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${item.border} ${item.bg} ${item.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display font-semibold text-white">
                      {item.label}
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      {item.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── How It Works ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            How the Swarm Works
          </h2>
          <p className="mt-3 text-slate-400">
            From query to intelligence in one seamless pipeline.
          </p>
        </div>

        <div className="relative mx-auto max-w-3xl">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 h-full w-px bg-gradient-to-b from-cyan-500/40 via-violet-500/40 to-rose-500/40 sm:left-1/2" />

          {[
            { step: "01", title: "Input Query", desc: "Enter your research topic into the neural command center.", color: "border-cyan-500/30 text-cyan-400" },
            { step: "02", title: "Agent Activation", desc: "Five specialized agents activate and begin parallel processing.", color: "border-emerald-500/30 text-emerald-400" },
            { step: "03", title: "Swarm Collaboration", desc: "Agents share insights, verify facts, and build upon each other's outputs.", color: "border-violet-500/30 text-violet-400" },
            { step: "04", title: "Intelligence Delivery", desc: "Research, verification, insights, summary, and presentations — all ready.", color: "border-amber-500/30 text-amber-400" },
            { step: "05", title: "Export & Present", desc: "Download boardroom-ready PDFs and PowerPoint decks instantly.", color: "border-rose-500/30 text-rose-400" }
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative flex items-start gap-4 py-6 ${i % 2 === 0 ? "" : "sm:flex-row-reverse sm:text-right"}`}
            >
              <span
                className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-[#030712] font-mono text-sm font-bold ${item.color}`}
              >
                {item.step}
              </span>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
