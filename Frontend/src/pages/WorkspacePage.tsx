import { type FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronRight,
  Clock,
  History,
  Play,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Terminal,
  Zap
} from "lucide-react";
import { AgentCard } from "@/components/swarm/AgentCard";
import { ThinkingPanel } from "@/components/swarm/ThinkingPanel";
import { SwarmGraph } from "@/components/swarm/SwarmGraph";
import { Button } from "@/components/ui/button";
import { useSwarmStore } from "@/store/swarmStore";
import { agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

const suggestions = [
  "Impact of AI agents on enterprise automation",
  "Quantum computing breakthroughs in 2025",
  "Future of autonomous multi-agent systems"
];

export function WorkspacePage() {
  const [topic, setTopic] = useState("");
  const {
    agents,
    activeAgent,
    currentThought,
    isRunning,
    error,
    runSwarm,
    reset,
    history,
    loadFromHistory
  } = useSwarmStore();

  const completedCount = agents.filter((a) => a.status === "Completed").length;
  const totalConfidence = agents.reduce((sum, a) => sum + a.confidence, 0);
  const avgConfidence = completedCount > 0 ? Math.round(totalConfidence / completedCount) : 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!topic.trim() || isRunning) return;
    void runSwarm(topic.trim());
  };

  return (
    <div className="space-y-6">
      {/* ─── Command Console ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden rounded-2xl"
      >
        {/* Top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="p-5 sm:p-6">
          {/* Header row */}
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.span
                animate={isRunning ? { rotate: [0, 360] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 text-cyan-400 border border-cyan-500/20"
              >
                <Terminal className="h-5 w-5" />
              </motion.span>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight text-white">
                  AI Command Center
                </h1>
                <p className="text-xs text-slate-400">
                  Deploy a research mission across the neural swarm
                </p>
              </div>
            </div>

            {/* Live agent status row */}
            <div className="hidden items-center gap-4 sm:flex">
              {/* Agent readiness dots with labels */}
              <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5">
                {agents.map((agent) => {
                  const identity = agentIdentities[agent.id];
                  const Icon = identity.icon;
                  return (
                    <div
                      key={agent.id}
                      className="group relative"
                      title={`${agent.name}: ${agent.status}`}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md transition-all duration-300",
                          agent.status === "Running"
                            ? `${identity.bgClass} ${identity.textClass}`
                            : agent.status === "Completed"
                            ? `${identity.bgClass} ${identity.textClass} opacity-70`
                            : agent.status === "Failed"
                            ? "bg-red-500/10 text-red-400"
                            : "bg-white/[0.04] text-slate-600"
                        )}
                      >
                        <Icon className={cn(
                          "h-3 w-3",
                          agent.status === "Running" && "animate-pulse"
                        )} />
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Stats */}
              {(isRunning || completedCount > 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-xs font-medium"
                >
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Zap className="h-3 w-3" />
                    {completedCount}/5
                  </span>
                  {avgConfidence > 0 && (
                    <span className="text-slate-500">· {avgConfidence}%</span>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Input form */}
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(e);
                  }
                }}
                className="min-h-[110px] w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 py-4 pl-12 pr-14 text-[15px] text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-500/30 focus:shadow-[0_0_40px_rgba(6,182,212,0.08)]"
                placeholder="What intelligence do you need? Describe your research mission..."
                aria-label="Research topic"
              />
              {/* Send icon in corner */}
              <button
                type="submit"
                disabled={!topic.trim() || isRunning}
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 transition-all hover:bg-cyan-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Submit"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Quick suggestions */}
            {!isRunning && !topic && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setTopic(s)}
                    className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-400 transition-all hover:border-cyan-500/20 hover:bg-cyan-500/[0.04] hover:text-cyan-300"
                  >
                    <Sparkles className="h-3 w-3" />
                    {s}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                size="lg"
                loading={isRunning}
                disabled={!topic.trim()}
              >
                <Play className="h-4 w-4" />
                {isRunning ? "Swarm Processing" : "Deploy Swarm"}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={reset}
                disabled={isRunning}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      {/* ─── Swarm Graph + Thinking Panel ─── */}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SwarmGraph agents={agents} activeAgent={activeAgent} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <ThinkingPanel
            activeAgent={activeAgent}
            currentThought={currentThought}
          />
        </motion.div>
      </div>

      {/* ─── Error Display ─── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-panel relative overflow-hidden rounded-xl border-red-500/20"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
            <div className="flex gap-3 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div>
                <p className="font-semibold text-red-300">
                  Mission Failed — Backend Error
                </p>
                <p className="mt-1 text-red-300/70">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Agent Cards ─── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <AgentCard agent={agent} active={activeAgent === agent.id} />
          </motion.div>
        ))}
      </div>

      {/* ─── History ─── */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-violet-400" />
              <h2 className="font-display text-base font-semibold text-white">
                Mission History
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {history.length} mission{history.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid gap-3 p-5 pt-0 md:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 6).map((item, i) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => loadFromHistory(item.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                whileHover={{ y: -2, scale: 1.01 }}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:border-cyan-500/20 hover:bg-cyan-500/[0.03]"
              >
                <p className="line-clamp-2 text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                  {item.topic}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    {new Date(
                      item.completedAt ?? item.startedAt
                    ).toLocaleString()}
                  </div>
                  <ChevronRight className="h-3 w-3 text-slate-600 transition-colors group-hover:text-cyan-400" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
