import { motion } from "framer-motion";
import { Blocks, Cpu, Signal, TrendingUp } from "lucide-react";
import { AgentCard } from "@/components/swarm/AgentCard";
import { SwarmGraph } from "@/components/swarm/SwarmGraph";
import { useSwarmStore } from "@/store/swarmStore";
import { agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

export function AgentDashboardPage() {
  const { agents, activeAgent } = useSwarmStore();
  const activeCount = agents.filter(
    (a) => a.status === "Running" || a.status === "Completed"
  ).length;
  const totalConfidence = agents.reduce((sum, a) => sum + a.confidence, 0);
  const avgConfidence = activeCount > 0 ? Math.round(totalConfidence / Math.max(agents.filter(a => a.confidence > 0).length, 1)) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Blocks className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Neural Network
              </h1>
              <p className="text-sm text-slate-400">
                Real-time agent topology, telemetry, and collaboration
              </p>
            </div>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-slate-300">
            <Cpu className="h-3 w-3 text-cyan-400" />
            {activeCount}/{agents.length} Active
          </span>
          {avgConfidence > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-300"
            >
              <TrendingUp className="h-3 w-3" />
              {avgConfidence}% avg
            </motion.span>
          )}
          {activeAgent && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
                agentIdentities[activeAgent].borderClass,
                agentIdentities[activeAgent].bgClass,
                agentIdentities[activeAgent].textClass
              )}
            >
              <Signal className="h-3 w-3 animate-pulse" />
              {activeAgent}
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Graph */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SwarmGraph agents={agents} activeAgent={activeAgent} />
      </motion.div>

      {/* Agent Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i + 0.15 }}
          >
            <AgentCard agent={agent} active={activeAgent === agent.id} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
