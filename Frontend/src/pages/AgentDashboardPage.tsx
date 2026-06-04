import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Blocks, Cpu, Signal, TrendingUp } from "lucide-react";
import { AgentCard } from "@/components/swarm/AgentCard";
import { SwarmGraph } from "@/components/swarm/SwarmGraph";
import { useSwarmStore } from "@/store/swarmStore";
import { agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

export function AgentDashboardPage() {

  const { agents, activeAgent, isRunning, results } = useSwarmStore();

  const [agentTimes, setAgentTimes] = useState<{
    research: string | null;
    summarizer: string | null;
    factcheck: string | null;
    insight: string | null;
    presentation: string | null;
  }>({
    research: null,
    summarizer: null,
    factcheck: null,
    insight: null,
    presentation: null
  });

  const mapAgentIdToKey = (id: string): "research" | "summarizer" | "factcheck" | "insight" | "presentation" => {
    if (id === "summary") return "summarizer";
    if (id === "insights") return "insight";
    return id as any;
  };

  const getProgressPercent = (agentId: string, status: string, currentProgress: number) => {
    if (status === "Idle") return 0;
    
    const targetMap: Record<string, number> = {
      research: 20,
      summary: 40,
      factcheck: 60,
      insights: 80,
      presentation: 100
    };
    
    const target = targetMap[agentId] || 0;
    const start = target - 20;

    if (status === "Completed") {
      return target;
    }
    
    return start + (currentProgress / 100) * 20;
  };

  // Track intervals per agent
  useEffect(() => {
    if (!isRunning) {
      if (!results) {
        setAgentTimes({
          research: null,
          summarizer: null,
          factcheck: null,
          insight: null,
          presentation: null
        });
      }
      return;
    }

    if (!activeAgent) return;

    const key = mapAgentIdToKey(activeAgent);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
      setAgentTimes((prev) => ({
        ...prev,
        [key]: timeTaken
      }));
    }, 100);

    return () => {
      clearInterval(interval);
      const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
      setAgentTimes((prev) => ({
        ...prev,
        [key]: timeTaken
      }));
    };
  }, [activeAgent, isRunning, results]);

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

        {agents.map((agent, i) => {
          const key = mapAgentIdToKey(agent.id);
          const timeTaken = agentTimes[key] || (agent.executionTime ? agent.executionTime.toFixed(1) : null);
          const progressPercent = getProgressPercent(agent.id, agent.status, agent.progress);

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i + 0.15 }}
            >
              <AgentCard
                agent={agent}
                active={activeAgent === agent.id}
                timeTaken={timeTaken}
                progressPercent={progressPercent}
              />
            </motion.div>
          );
        })}

      </div>
    </div>
  );
}
