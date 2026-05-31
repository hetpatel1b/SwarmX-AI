import { memo, useMemo } from "react";
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

function ConfidenceRing({
  value,
  color,
  size = 44
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const circumference = 2 * Math.PI * r;
  const safeValue = Math.max(0, Math.min(100, value ?? 0));
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(148, 163, 184, 0.08)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
      </svg>
      <span className="absolute font-mono text-[10px] font-bold text-white">
        {safeValue > 0 ? `${Math.round(safeValue)}` : "—"}
      </span>
    </div>
  );
}

export const AgentCard = memo(function AgentCard({
  agent,
  active
}: {
  agent: AgentState;
  active: boolean;
}) {
  const identity = agentIdentities[agent.id];
  const AgentIcon = identity.icon;
  const StatusIcon = statusIcon[agent.status];

  const safeProgress = Math.max(0, Math.min(100, agent.progress ?? 0));
  const safeConfidence = Math.max(0, Math.min(100, agent.confidence ?? 0));
  const safeExecutionTime = agent.executionTime ?? 0;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="h-full"
    >
      <div
        className={cn(
          "glass-panel relative h-full overflow-hidden rounded-xl transition-all duration-400",
          active && identity.glowClass,
          active && identity.borderClass,
          agent.status === "Completed" && `${identity.borderClass} border-opacity-50`
        )}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent transition-opacity duration-500",
            active || agent.status === "Completed" ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${identity.color}${active ? "80" : "40"}, transparent)`
          }}
        />

        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${identity.color}08, transparent 70%)`
            }}
          />
        )}

        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300",
                  active
                    ? `${identity.borderClass} ${identity.bgClass} ${identity.textClass}`
                    : agent.status === "Completed"
                    ? `${identity.borderClass} ${identity.bgClass} ${identity.textClass} opacity-80`
                    : "border-white/10 bg-white/[0.05] text-slate-400"
                )}
              >
                <AgentIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-white truncate">
                  {agent.name.replace(" Agent", "")}
                </h3>
                <p className="text-[10px] text-slate-500 truncate">{agent.role}</p>
              </div>
            </div>

            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-lg",
                agent.status === "Running" && `${identity.bgClass} ${identity.textClass}`,
                agent.status === "Completed" && "bg-emerald-500/10 text-emerald-400",
                agent.status === "Failed" && "bg-red-500/10 text-red-400",
                agent.status === "Idle" && "bg-white/[0.04] text-slate-600"
              )}
            >
              <StatusIcon className={cn("h-3 w-3", agent.status === "Running" && "animate-spin")} />
            </span>
          </div>
        </div>

        <div className="px-4 pb-2">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-slate-500">
            <span>{agent.status}</span>
            <span className="font-mono">{Math.round(safeProgress)}%</span>
          </div>
          <Progress value={safeProgress} color={identity.progressColor} />
        </div>

        <div className="flex items-center gap-3 px-4 pb-4 pt-2">
          <ConfidenceRing value={safeConfidence} color={identity.color} />
          <div className="min-w-0 flex-1">
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-2">
              <p className="text-[9px] font-medium uppercase tracking-wider text-slate-500">
                Execution
              </p>
              <p className="mt-0.5 font-mono text-xs font-semibold text-white truncate">
                {safeExecutionTime ? formatSeconds(safeExecutionTime) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
