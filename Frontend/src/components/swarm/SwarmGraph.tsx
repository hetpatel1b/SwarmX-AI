import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node
} from "reactflow";
import type { AgentId, AgentState } from "@/types/swarm";
import { agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

// Pentagon layout — more visually interesting than linear
const positions: Record<AgentId, { x: number; y: number }> = {
  research: { x: 380, y: 10 },
  factcheck: { x: 700, y: 150 },
  insights: { x: 600, y: 380 },
  summary: { x: 160, y: 380 },
  presentation: { x: 60, y: 150 }
};

// Full mesh connections — shows collaboration, not just a pipeline
const edgePairs: [AgentId, AgentId][] = [
  ["research", "factcheck"],
  ["factcheck", "insights"],
  ["insights", "summary"],
  ["summary", "presentation"],
  ["presentation", "research"],
  // Cross connections
  ["research", "insights"],
  ["factcheck", "summary"]
];

export function SwarmGraph({
  agents,
  activeAgent
}: {
  agents: AgentState[];
  activeAgent: AgentId | null;
}) {
  const nodes: Node[] = useMemo(() => agents.map((agent) => {
    const identity = agentIdentities[agent.id];
    const Icon = identity.icon;
    const isActive = activeAgent === agent.id;
    const isCompleted = agent.status === "Completed";
    const isFailed = agent.status === "Failed";

    return {
      id: agent.id,
      position: positions[agent.id],
      data: {
        label: (
          <div className="flex items-center gap-3 min-w-[170px]">
            {/* Agent icon with glow */}
            <span
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300",
                isActive
                  ? `${identity.borderClass} ${identity.bgClass} ${identity.textClass}`
                  : isCompleted
                  ? `${identity.borderClass} ${identity.bgClass} ${identity.textClass} opacity-80`
                  : isFailed
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-white/10 bg-white/[0.05] text-slate-400"
              )}
            >
              <Icon className="h-4 w-4" />
              {isActive && (
                <span
                  className="absolute -inset-1 rounded-xl animate-pulse"
                  style={{
                    border: `1px solid ${identity.color}30`,
                    boxShadow: `0 0 16px ${identity.color}15`
                  }}
                />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">
                  {agent.name.replace(" Agent", "")}
                </span>
                {isActive && (
                  <span className="flex h-1.5 w-1.5">
                    <span className={cn("absolute h-1.5 w-1.5 rounded-full animate-ping opacity-50", identity.dotClass)} />
                    <span className={cn("h-1.5 w-1.5 rounded-full", identity.dotClass)} />
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? identity.dotClass
                      : isCompleted ? identity.dotClass
                      : isFailed ? "bg-red-400"
                      : "bg-slate-600"
                  )}
                />
                <span>{agent.status}</span>
                {agent.confidence > 0 && (
                  <span className="text-slate-500">
                    · {Math.round(agent.confidence)}%
                  </span>
                )}
              </div>

              {/* Mini progress bar */}
              {(isActive || isCompleted) && (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                      identity.gradient
                    )}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )
      },
      style: {
        borderRadius: 16,
        border: isActive
          ? `1px solid ${identity.color}55`
          : isCompleted
          ? `1px solid ${identity.color}25`
          : "1px solid rgba(148, 163, 184, 0.08)",
        background: isActive
          ? `linear-gradient(135deg, ${identity.color}14, ${identity.color}06)`
          : "rgba(3, 7, 18, 0.88)",
        backdropFilter: "blur(20px)",
        color: "white",
        padding: 14,
        boxShadow: isActive
          ? `0 0 48px ${identity.color}20, 0 0 96px ${identity.color}06, inset 0 1px 0 rgba(255,255,255,0.04)`
          : "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.02)",
        transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
      }
    };
  }), [agents, activeAgent]);

  const edges: Edge[] = useMemo(() => edgePairs.map(([source, target]) => {
    const sourceAgent = agents.find((a) => a.id === source);
    const targetAgent = agents.find((a) => a.id === target);
    const isTransferring =
      activeAgent === source || activeAgent === target;
    const isCompleted =
      sourceAgent?.status === "Completed" &&
      targetAgent?.status === "Completed";
    const sourceIdentity = agentIdentities[source];

    return {
      id: `${source}-${target}`,
      source,
      target,
      animated: isTransferring,
      style: {
        stroke: isTransferring
          ? sourceIdentity.color
          : isCompleted
          ? `${sourceIdentity.color}50`
          : "rgba(148, 163, 184, 0.08)",
        strokeWidth: isTransferring ? 2 : 1,
        filter: isTransferring
          ? `drop-shadow(0 0 8px ${sourceIdentity.color}40)`
          : "none",
        transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)"
      },
      type: "smoothstep"
    };
  }), [agents, activeAgent]);

  return (
    <div className="glass-panel relative h-[440px] min-h-[380px] overflow-hidden rounded-2xl">
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Neural Network label */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#030712]/80 px-3 py-1.5 backdrop-blur-sm">
        <span className="relative flex h-1.5 w-1.5">
          {activeAgent && (
            <span className="absolute h-full w-full rounded-full bg-cyan-400 animate-ping opacity-50" />
          )}
          <span className={cn(
            "h-1.5 w-1.5 rounded-full",
            activeAgent ? "bg-cyan-400" : "bg-slate-600"
          )} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {activeAgent ? "Processing" : "Neural Topology"}
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="rgba(148, 163, 184, 0.03)"
          gap={40}
          size={1}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
