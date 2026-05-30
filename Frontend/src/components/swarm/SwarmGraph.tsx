import ReactFlow, { Background, Controls, type Edge, type Node } from "reactflow";
import type { AgentId, AgentState } from "@/types/swarm";

const positions: Record<AgentId, { x: number; y: number }> = {
  research: { x: 20, y: 100 },
  factcheck: { x: 250, y: 20 },
  insights: { x: 480, y: 100 },
  summary: { x: 710, y: 20 },
  presentation: { x: 940, y: 100 }
};

export function SwarmGraph({ agents, activeAgent }: { agents: AgentState[]; activeAgent: AgentId | null }) {
  const nodes: Node[] = agents.map((agent) => ({
    id: agent.id,
    position: positions[agent.id],
    data: {
      label: (
        <div className="min-w-[150px]">
          <div className="text-sm font-semibold text-white">{agent.name.replace(" Agent", "")}</div>
          <div className="mt-1 text-xs text-slate-400">{agent.status}</div>
        </div>
      )
    },
    style: {
      borderRadius: 8,
      border: activeAgent === agent.id ? "1px solid #67e8f9" : "1px solid rgba(148, 163, 184, 0.22)",
      background: activeAgent === agent.id ? "rgba(8, 145, 178, 0.35)" : "rgba(15, 23, 42, 0.78)",
      backdropFilter: "blur(18px)",
      color: "white",
      padding: 12,
      boxShadow: activeAgent === agent.id ? "0 0 36px rgba(103, 232, 249, 0.32)" : "none"
    }
  }));

  const edges: Edge[] = [
    ["research", "factcheck"],
    ["factcheck", "insights"],
    ["insights", "summary"],
    ["summary", "presentation"]
  ].map(([source, target]) => ({
    id: `${source}-${target}`,
    source,
    target,
    animated: Boolean(activeAgent),
    style: { stroke: "#22d3ee", strokeWidth: 2 },
    type: "smoothstep"
  }));

  return (
    <div className="h-[360px] min-h-[320px] overflow-hidden rounded-lg border border-white/10 bg-[#060b14]/90">
      <ReactFlow nodes={nodes} edges={edges} fitView nodesDraggable={false} nodesConnectable={false} zoomOnScroll={false}>
        <Background color="#1e293b" gap={22} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
