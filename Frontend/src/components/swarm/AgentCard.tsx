import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { AgentState } from "@/types/swarm";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatSeconds } from "@/utils/format";
import { agentIdentities } from "@/utils/agents";

const statusIcon = {
  Idle: Circle,
  Running: Loader2,
  Completed: CheckCircle2,
  Failed: XCircle
};

export function AgentCard({
  agent,
  active
}: {
  agent: AgentState;
  active: boolean;
}) {
  const identity = agentIdentities[agent.id];
  const AgentIcon = identity.icon;
  const StatusIcon = statusIcon[agent.status];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <div
        className={cn(
          "glass-panel relative h-full overflow-hidden rounded-xl transition-all duration-300",
          active && identity.glowClass,
          active && identity.borderClass
        )}
      >
        {/* Top glow line */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent transition-opacity duration-500",
            active ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${identity.color}60, transparent)`
          }}
        />

        {/* Header */}
        <div className="space-y-1.5 p-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300",
                  active
                    ? `${identity.borderClass} ${identity.bgClass} ${identity.textClass}`
                    : agent.status === "Completed"
                    ? `${identity.borderClass} ${identity.bgClass} ${identity.textClass} opacity-70`
                    : "border-white/10 bg-white/[0.05] text-slate-400"
                )}
              >
                <AgentIcon className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {agent.name.replace(" Agent", "")}
                </h3>
                <p className="text-[11px] text-slate-500">{agent.role}</p>
              </div>
            </div>

            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]",
                agent.status === "Running" && identity.textClass,
                agent.status === "Completed" && "text-emerald-400",
                agent.status === "Failed" && "text-red-400"
              )}
            >
              <StatusIcon
                className={cn(
                  "h-3.5 w-3.5",
                  agent.status === "Running" && "animate-spin"
                )}
              />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          {/* Status + progress */}
          <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>{agent.status}</span>
            <span>{Math.round(agent.progress)}%</span>
          </div>
          <Progress
            value={agent.progress}
            color={identity.progressColor}
          />

          {/* Telemetry */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Exec Time
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-white">
                {agent.executionTime
                  ? formatSeconds(agent.executionTime)
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2.5">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Confidence
              </p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-white">
                {agent.confidence > 0
                  ? `${Math.round(agent.confidence)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
