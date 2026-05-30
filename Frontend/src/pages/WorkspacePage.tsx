import { type FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  History,
  Play,
  RotateCcw,
  Search,
  Terminal
} from "lucide-react";
import { AgentCard } from "@/components/swarm/AgentCard";
import { ThinkingPanel } from "@/components/swarm/ThinkingPanel";
import { SwarmGraph } from "@/components/swarm/SwarmGraph";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSwarmStore } from "@/store/swarmStore";
import { agentIdentities } from "@/utils/agents";

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
          {/* Header */}
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Terminal className="h-4 w-4" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white">
                AI Command Center
              </h1>
              <p className="text-xs text-slate-400">
                Enter a research mission and watch the swarm collaborate
              </p>
            </div>

            {/* Agent readiness indicators */}
            <div className="ml-auto hidden items-center gap-1.5 sm:flex">
              {agents.map((agent) => {
                const identity = agentIdentities[agent.id];
                return (
                  <div
                    key={agent.id}
                    className="group relative flex items-center"
                    title={`${agent.name}: ${agent.status}`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                        agent.status === "Running"
                          ? `${identity.dotClass} animate-pulse shadow-[0_0_8px_currentColor]`
                          : agent.status === "Completed"
                          ? `${identity.dotClass} opacity-80`
                          : agent.status === "Failed"
                          ? "bg-red-400"
                          : "bg-slate-600"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input form */}
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px] w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 py-4 pl-12 pr-4 text-base text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-cyan-500/40 focus:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                placeholder="What intelligence do you need? e.g. 'Analyze the impact of AI agents on enterprise automation...'"
                aria-label="Research topic"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                size="lg"
                loading={isRunning}
                disabled={!topic.trim()}
              >
                <Play className="h-4 w-4" />
                {isRunning ? "Swarm Active" : "Deploy Swarm"}
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

      {/* ─── Loading State ─── */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-3 md:grid-cols-3"
          >
            <Skeleton className="h-3 rounded-full" />
            <Skeleton className="h-3 rounded-full" />
            <Skeleton className="h-3 rounded-full" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Error Display ─── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-panel overflow-hidden rounded-xl border-red-500/20"
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
          className="glass-panel overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
          <div className="flex items-center gap-2 p-5 pb-3">
            <History className="h-4 w-4 text-violet-400" />
            <h2 className="font-display text-base font-semibold text-white">
              Mission History
            </h2>
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
                whileHover={{ scale: 1.01 }}
                className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition-all hover:border-cyan-500/20 hover:bg-white/[0.06]"
              >
                <p className="line-clamp-2 font-medium text-white group-hover:text-cyan-300 transition-colors">
                  {item.topic}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {new Date(
                    item.completedAt ?? item.startedAt
                  ).toLocaleString()}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
