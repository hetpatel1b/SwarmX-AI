import { useMemo, useEffect, useRef, useCallback, memo } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Edge,
  type Node
} from "reactflow";
import type { AgentId, AgentState } from "@/types/swarm";
import { agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

// Pentagon layout
const positions: Record<AgentId, { x: number; y: number }> = {
  research: { x: 380, y: 10 },
  factcheck: { x: 700, y: 150 },
  insights: { x: 600, y: 380 },
  summary: { x: 160, y: 380 },
  presentation: { x: 60, y: 150 }
};

const edgePairs: [AgentId, AgentId][] = [
  ["research", "factcheck"],
  ["factcheck", "insights"],
  ["insights", "summary"],
  ["summary", "presentation"],
  ["presentation", "research"],
  ["research", "insights"],
  ["factcheck", "summary"]
];

// === Energy Particle Overlay ===
interface EnergyParticle {
  edgeIndex: number;
  t: number; // 0-1 progress along edge
  speed: number;
  size: number;
  hue: number;
}

function EnergyParticlesOverlay({ agents, activeAgent }: { agents: AgentState[]; activeAgent: AgentId | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<EnergyParticle[]>([]);
  const rafRef = useRef(0);

  const activeEdges = useMemo(() => {
    return edgePairs.map(([source, target], idx) => {
      const sourceAgent = agents.find(a => a.id === source);
      const targetAgent = agents.find(a => a.id === target);
      const isActive = activeAgent === source || activeAgent === target;
      const isCompleted = sourceAgent?.status === "Completed" && targetAgent?.status === "Completed";
      return { idx, source, target, isActive, isCompleted };
    }).filter(e => e.isActive || e.isCompleted);
  }, [agents, activeAgent]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * 2 || canvas.height !== rect.height * 2) {
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    }

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Spawn particles for active edges
    while (particlesRef.current.length < activeEdges.length * 3 && activeEdges.length > 0) {
      const edge = activeEdges[Math.floor(Math.random() * activeEdges.length)];
      const identity = agentIdentities[edge.source];
      particlesRef.current.push({
        edgeIndex: edge.idx,
        t: 0,
        speed: 0.003 + Math.random() * 0.006,
        size: 1.5 + Math.random() * 2,
        hue: parseInt(identity.color.replace("#", ""), 16) > 0 ? 0 : 188 // We'll use the actual agent color
      });
    }

    // Scale positions to canvas
    const scaleX = rect.width / 800;
    const scaleY = rect.height / 440;

    particlesRef.current = particlesRef.current.filter(p => {
      p.t += p.speed;
      if (p.t > 1) return false;

      const pair = edgePairs[p.edgeIndex];
      if (!pair) return false;
      const [srcId, tgtId] = pair;
      const src = positions[srcId];
      const tgt = positions[tgtId];
      const x = (src.x + (tgt.x - src.x) * p.t + 95) * scaleX;
      const y = (src.y + (tgt.y - src.y) * p.t + 40) * scaleY;

      const identity = agentIdentities[srcId];
      const alpha = Math.sin(p.t * Math.PI) * 0.8;

      // Glow
      const glow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 4);
      glow.addColorStop(0, `${identity.color}${Math.round(alpha * 40).toString(16).padStart(2, "0")}`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(x - p.size * 4, y - p.size * 4, p.size * 8, p.size * 8);

      // Core
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${identity.color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
      ctx.fill();

      return true;
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [activeEdges]);

  useEffect(() => {
    if (activeEdges.length === 0) {
      particlesRef.current = [];
      return;
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, activeEdges.length]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-[5] pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

export const SwarmGraph = memo(function SwarmGraph({
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
                {(agent.confidence ?? 0) > 0 && (
                  <span className="text-slate-500">
                    · {Math.round(agent.confidence)}%
                  </span>
                )}
              </div>

              {(isActive || isCompleted) && (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                      identity.gradient
                    )}
                    style={{ width: `${agent.progress ?? 0}%` }}
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
    const isTransferring = activeAgent === source || activeAgent === target;
    const isCompleted = sourceAgent?.status === "Completed" && targetAgent?.status === "Completed";
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

      {/* Energy particles canvas overlay */}
      <EnergyParticlesOverlay agents={agents} activeAgent={activeAgent} />

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

      {/* Active agent signal badge */}
      {activeAgent && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-[#030712]/80 px-2.5 py-1.5 backdrop-blur-sm">
          <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", agentIdentities[activeAgent].dotClass)} />
          <span className={cn("text-[10px] font-semibold uppercase tracking-wider", agentIdentities[activeAgent].textClass)}>
            {activeAgent}
          </span>
        </div>
      )}

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
});
