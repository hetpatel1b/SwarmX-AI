import { AgentCard } from "@/components/swarm/AgentCard";
import { SwarmGraph } from "@/components/swarm/SwarmGraph";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSwarmStore } from "@/store/swarmStore";

export function AgentDashboardPage() {
  const { agents, activeAgent } = useSwarmStore();
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Visualization Dashboard</CardTitle>
          <p className="text-sm text-slate-400">Real-time topology, status, confidence, and execution telemetry.</p>
        </CardHeader>
        <CardContent>
          <SwarmGraph agents={agents} activeAgent={activeAgent} />
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} active={activeAgent === agent.id} />
        ))}
      </div>
    </div>
  );
}
