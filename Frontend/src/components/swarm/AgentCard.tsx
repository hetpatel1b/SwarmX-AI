import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { AgentState } from "@/types/swarm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatSeconds } from "@/utils/format";

const statusIcon = {
  Idle: Circle,
  Running: Loader2,
  Completed: CheckCircle2,
  Failed: XCircle
};

export function AgentCard({ agent, active }: { agent: AgentState; active: boolean }) {
  const Icon = statusIcon[agent.status];
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 260, damping: 22 }}>
      <Card className={cn("h-full overflow-hidden", active && "border-cyan-300/60 shadow-glow")}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{agent.name}</CardTitle>
              <p className="mt-1 text-sm text-slate-400">{agent.role}</p>
            </div>
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.08]",
                agent.status === "Running" && "text-cyan-300",
                agent.status === "Completed" && "text-emerald-300",
                agent.status === "Failed" && "text-red-300"
              )}
            >
              <Icon className={cn("h-4 w-4", agent.status === "Running" && "animate-spin")} />
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
            <span>{agent.status}</span>
            <span>{Math.round(agent.progress)}%</span>
          </div>
          <Progress value={agent.progress} />
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-slate-500">Execution</p>
              <p className="mt-1 font-semibold text-white">{agent.executionTime ? formatSeconds(agent.executionTime) : "Ready"}</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-xs text-slate-500">Confidence</p>
              <p className="mt-1 font-semibold text-white">{Math.round(agent.confidence)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
