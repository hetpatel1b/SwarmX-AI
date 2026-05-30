import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  ChevronRight,
  Cpu,
  FileText,
  Lightbulb,
  Network,
  Presentation,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PageKey } from "@/layouts/AppLayout";
import { useSwarmStore } from "@/store/swarmStore";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
});

const capabilities = [
  {
    icon: Brain,
    label: "Deep Research",
    desc: "Autonomous source gathering across academic databases, web content, and domain-specific knowledge bases.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "group-hover:shadow-[0_0_40px_rgba(6,182,212,0.12)]"
  },
  {
    icon: ShieldCheck,
    label: "Fact Verification",
    desc: "Multi-source claim validation with evidence scoring and cryptographic trust signal generation.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.12)]"
  },
  {
    icon: Lightbulb,
    label: "Insight Extraction",
    desc: "Pattern detection, trend analysis, and strategic recommendations surfaced from multi-agent consensus.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    glow: "group-hover:shadow-[0_0_40px_rgba(139,92,246,0.12)]"
  },
  {
    icon: FileText,
    label: "Executive Synthesis",
    desc: "Boardroom-ready summaries, key findings, and exportable intelligence briefs generated autonomously.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "group-hover:shadow-[0_0_40px_rgba(245,158,11,0.12)]"
  },
  {
    icon: Presentation,
    label: "Presentation Design",
    desc: "Narrative-driven slide creation with structured talking points ready for stakeholder delivery.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "group-hover:shadow-[0_0_40px_rgba(244,63,94,0.12)]"
  }
];

const metrics = [
  { label: "Trust Score", value: "96%", icon: Shield, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { label: "Agent Accuracy", value: "98.2%", icon: Zap, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { label: "Research Speed", value: "<30s", icon: Sparkles, color: "text-violet-400", bg: "bg-violet-500/10" },
  { label: "Active Agents", value: "5", icon: Network, color: "text-amber-400", bg: "bg-amber-500/10" }
];

const agentNodes = [
  { icon: Brain, label: "Research", color: "#06b6d4", x: 50, y: 50 },
  { icon: ShieldCheck, label: "Verify", color: "#10b981", x: 85, y: 25 },
  { icon: Lightbulb, label: "Insights", color: "#8b5cf6", x: 85, y: 75 },
  { icon: FileText, label: "Summarize", color: "#f59e0b", x: 15, y: 25 },
  { icon: Presentation, label: "Present", color: "#f43f5e", x: 15, y: 75 }
];

export function LandingPage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const results = useSwarmStore((s) => s.results);

  return (
    <div className="space-y-24 pb-16">
      {/* ─── Hero Section ─── */}
      <section className="relative flex min-h-[calc(100vh-140px)] flex-col items-center justify-center text-center">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[700px] rounded-full bg-cyan-500/[0.08] blur-[140px]" />
          <div className="absolute h-[450px] w-[550px] translate-x-40 translate-y-10 rounded-full bg-violet-500/[0.07] blur-[140px]" />
          <div className="absolute h-[300px] w-[400px] -translate-x-32 translate-y-20 rounded-full bg-rose-500/[0.04] blur-[120px]" />
        </div>

        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
            Microsoft Build AI Agent Hackathon
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeUp(0.12)}
          className="mt-10 font-display text-6xl font-extrabold leading-[1.05] tracking-[-0.03em] text-white sm:text-7xl lg:text-[5.5rem]"
        >
          <span className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            Swarm
          </span>
          <span className="bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-600 bg-clip-text text-transparent">
            X
          </span>{" "}
          <span className="bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
            AI
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          {...fadeUp(0.22)}
          className="mt-7 max-w-xl font-display text-xl font-medium leading-relaxed sm:text-2xl"
        >
          <span className="text-white">One AI Thinks.</span>{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-rose-300 bg-clip-text text-transparent">
            A Swarm Understands.
          </span>
        </motion.p>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.32)}
          className="mt-5 max-w-lg text-sm leading-7 text-slate-400"
        >
          Five autonomous agents — research, verification, insight, synthesis,
          and presentation — orchestrated as a single intelligence swarm.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...fadeUp(0.42)}
          className="mt-12 flex flex-col gap-3 sm:flex-row"
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

        {/* ─── Orbital Agent Visualization ─── */}
        <motion.div
          {...fadeUp(0.5)}
          className="relative mt-20 h-[280px] w-[280px] sm:h-[340px] sm:w-[340px]"
        >
          {/* Center core */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 shadow-[0_0_60px_rgba(6,182,212,0.2)]"
            >
              <Sparkles className="h-7 w-7 text-cyan-400" />
            </motion.div>
          </div>

          {/* Orbital rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-white/[0.04]"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            className="absolute inset-10 rounded-full border border-dashed border-white/[0.03]"
          />

          {/* Agent nodes */}
          {agentNodes.map((node, i) => {
            const Icon = node.icon;
            return (
              <motion.div
                key={node.label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.5, ease: "backOut" }}
                className="absolute"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                  className="group flex flex-col items-center gap-1.5"
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl border backdrop-blur-sm transition-all duration-300 group-hover:scale-110"
                    style={{
                      borderColor: `${node.color}40`,
                      background: `${node.color}15`,
                      boxShadow: `0 0 24px ${node.color}20`
                    }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: node.color }} />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {node.label}
                  </span>
                </motion.div>

                {/* Connection line to center */}
                <svg
                  className="pointer-events-none absolute left-1/2 top-1/2 -z-10"
                  style={{
                    width: "200px",
                    height: "200px",
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="100"
                    stroke={`${node.color}15`}
                    strokeWidth="1"
                    strokeDasharray="3 6"
                  />
                </svg>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-6 flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] uppercase tracking-[0.15em] text-slate-600">Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex h-7 w-4 items-start justify-center rounded-full border border-slate-700 p-1"
          >
            <span className="h-1.5 w-1 rounded-full bg-slate-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Live Metrics Strip ─── */}
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
                whileHover={{ y: -3 }}
                className="group glass-panel relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:border-white/[0.15]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center gap-3.5">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.bg} ${m.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
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

      {/* ─── Agent Intelligence Architecture ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-10"
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400/70"
          >
            Intelligence Architecture
          </motion.p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Five agents. One mission.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Each agent is a specialized neural process, trained for a single task.
            Together, they form a coordinated intelligence swarm.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className={`group glass-panel relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:border-white/[0.15] ${item.glow}`}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                {/* Number */}
                <span className="absolute right-3 top-3 font-mono text-[10px] font-bold text-slate-600">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${item.border} ${item.bg} ${item.color} transition-all duration-300 group-hover:scale-105`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-sm font-semibold text-white">
                  {item.label}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── How It Works — Horizontal Pipeline ─── */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-10"
      >
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-400/70">
            Pipeline
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From query to intelligence
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            One seamless pipeline. Five parallel agents. Zero manual intervention.
          </p>
        </div>

        {/* Horizontal pipeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-rose-500/30 sm:block" />

          <div className="grid gap-4 sm:grid-cols-5">
            {[
              { step: "01", title: "Query", desc: "Input your research mission", color: "border-cyan-500/30 text-cyan-400", dotColor: "bg-cyan-400" },
              { step: "02", title: "Research", desc: "Sources gathered & analyzed", color: "border-emerald-500/30 text-emerald-400", dotColor: "bg-emerald-400" },
              { step: "03", title: "Verify", desc: "Claims cross-validated", color: "border-violet-500/30 text-violet-400", dotColor: "bg-violet-400" },
              { step: "04", title: "Synthesize", desc: "Intelligence consolidated", color: "border-amber-500/30 text-amber-400", dotColor: "bg-amber-400" },
              { step: "05", title: "Deliver", desc: "Export-ready output", color: "border-rose-500/30 text-rose-400", dotColor: "bg-rose-400" }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                {/* Node dot */}
                <div className="relative mb-4 flex h-[76px] items-center justify-center">
                  <span
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border bg-[#030712] font-mono text-sm font-bold ${item.color}`}
                  >
                    {item.step}
                  </span>
                  <span className={`absolute h-2 w-2 -bottom-1 rounded-full ${item.dotColor} hidden sm:block`} />
                </div>

                <h3 className="font-display text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── CTA Banner ─── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-panel gradient-border relative overflow-hidden rounded-2xl p-8 text-center sm:p-12"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
        <div className="relative">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to deploy your first swarm?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-400">
            Experience how five specialized agents collaborate in real-time
            to deliver intelligence that a single model cannot.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" onClick={() => onNavigate("workspace")}>
              <Sparkles className="h-4 w-4" />
              Start Research Mission
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate("analytics")}>
              View Analytics
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
