import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, History, Play, RotateCcw } from "lucide-react";
import { AgentCard } from "@/components/swarm/AgentCard";
import { ThinkingPanel } from "@/components/swarm/ThinkingPanel";
import { SwarmGraph } from "@/components/swarm/SwarmGraph";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSwarmStore } from "@/store/swarmStore";

export function WorkspacePage() {
  const [topic, setTopic] = useState("");
  const { agents, activeAgent, currentThought, isRunning, error, runSwarm, reset, history, loadFromHistory } = useSwarmStore();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!topic.trim() || isRunning) return;
    void runSwarm(topic.trim());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Swarm Workspace</CardTitle>
          <p className="text-sm text-slate-400">Enter a research topic and watch the autonomous agents collaborate.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="min-h-24 resize-none rounded-lg border border-white/10 bg-black/30 p-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
              placeholder="Research topic"
              aria-label="Research topic"
            />
            <Button type="submit" size="lg" disabled={isRunning}>
              <Play className="h-5 w-5" /> Run Swarm
            </Button>
            <Button type="button" size="lg" variant="secondary" onClick={reset} disabled={isRunning}>
              <RotateCcw className="h-5 w-5" /> Reset
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SwarmGraph agents={agents} activeAgent={activeAgent} />
        </motion.div>
        <ThinkingPanel activeAgent={activeAgent} currentThought={currentThought} />
      </div>

      {isRunning && (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
          <Skeleton className="h-3" />
        </div>
      )}

      {error && (
        <Card className="border-red-300/30 bg-red-500/10">
          <CardContent className="flex gap-3 p-4 text-sm text-red-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold">Backend request failed</p>
              <p className="mt-1 text-red-100/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} active={activeAgent === agent.id} />
        ))}
      </div>

      {history.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <History className="h-4 w-4 text-cyan-300" />
            <CardTitle>Local History</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {history.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => loadFromHistory(item.id)}
                className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-cyan-300/50 hover:bg-white/10"
              >
                <p className="line-clamp-2 font-medium text-white">{item.topic}</p>
                <p className="mt-2 text-xs text-slate-400">{new Date(item.completedAt ?? item.startedAt).toLocaleString()}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
