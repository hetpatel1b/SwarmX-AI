import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import type { AgentId } from "@/types/swarm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { thinkingScripts } from "@/utils/agents";

export function ThinkingPanel({ activeAgent, currentThought }: { activeAgent: AgentId | null; currentThought: string }) {
  const lines = activeAgent ? thinkingScripts[activeAgent] : [currentThought];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-cyan-300" />
          <CardTitle>Agent Thinking</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {lines.map((line, index) => (
          <motion.div
            key={`${line}-${index}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12 }}
            className="flex items-center gap-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm text-slate-300"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-glow" />
            <span>{activeAgent ? line : currentThought}</span>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
