import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node
} from "reactflow";
import type { AgentId, AgentState } from "@/types/swarm";
import { agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

const positions: Record<AgentId, { x: number; y: number }> = {
  research: { x: 20, y: 100 },
  factcheck: { x: 260, y: 10 },
  insights: { x: 500, y: 100 },
  summary: { x: 740, y: 10 },
  presentation: { x: 980, y: 100 }
};

const edgePairs: [AgentId, AgentId][] = [
  ["research", "factcheck"],
  ["factcheck", "insights"],
  ["insights", "summary"],
  ["summary", "presentation"]
];

export function SwarmGraph({
  agents,
  activeAgent
}: {
  agents: AgentState[];
  activeAgent: AgentId | null;
}) {
  const nodes: Node[] = agents.map((agent) => {
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
          <div className="flex items-center gap-3 min-w-[160px]">
            {/* Agent icon */}
            <span
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300",
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
            </span>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white">
                {agent.name.replace(" Agent", "")}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isActive
                      ? `${identity.dotClass} animate-pulse`
                      : isCompleted
                      ? identity.dotClass
                      : isFailed
                      ? "bg-red-400"
                      : "bg-slate-600"
                  )}
                />
                {agent.status}
                {agent.confidence > 0 && (
                  <span className="text-slate-500">
                    · {Math.round(agent.confidence)}%
                  </span>
                )}
              </div>

              {/* Mini progress bar */}
              {(isActive || isCompleted) && (
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
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
          ? `1px solid ${identity.color}33`
          : "1px solid rgba(148, 163, 184, 0.1)",
        background: isActive
          ? `linear-gradient(135deg, ${identity.color}18, ${identity.color}08)`
          : "rgba(3, 7, 18, 0.85)",
        backdropFilter: "blur(20px)",
        color: "white",
        padding: 14,
        boxShadow: isActive
          ? `0 0 40px ${identity.color}22, 0 0 80px ${identity.color}08`
          : "0 4px 24px rgba(0,0,0,0.3)",
        transition: "all 0.4s ease"
      }
    };
  });

  const edges: Edge[] = edgePairs.map(([source, target]) => {
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
          ? `${sourceIdentity.color}80`
          : "rgba(148, 163, 184, 0.15)",
        strokeWidth: isTransferring ? 2.5 : 1.5,
        filter: isTransferring
          ? `drop-shadow(0 0 6px ${sourceIdentity.color}50)`
          : "none",
        transition: "all 0.4s ease"
      },
      type: "smoothstep"
    };
  });

  return (
    <div className="h-[380px] min-h-[320px] overflow-hidden rounded-xl border border-white/[0.06] bg-[#030712]/80">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="rgba(148, 163, 184, 0.04)"
          gap={32}
          size={1}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
