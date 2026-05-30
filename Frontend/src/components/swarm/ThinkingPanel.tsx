import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Terminal } from "lucide-react";
import type { AgentId } from "@/types/swarm";
import { thinkingScripts, agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

// Pre-defined color maps to avoid Tailwind purging dynamic classes
const borderColorMap: Record<string, string> = {
  research: "border-cyan-500/10",
  factcheck: "border-emerald-500/10",
  insights: "border-violet-500/10",
  summary: "border-amber-500/10",
  presentation: "border-rose-500/10"
};

const bgColorMap: Record<string, string> = {
  research: "bg-cyan-500/[0.04]",
  factcheck: "bg-emerald-500/[0.04]",
  insights: "bg-violet-500/[0.04]",
  summary: "bg-amber-500/[0.04]",
  presentation: "bg-rose-500/[0.04]"
};

export function ThinkingPanel({
  activeAgent,
  currentThought
}: {
  activeAgent: AgentId | null;
  currentThought: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lines = activeAgent ? thinkingScripts[activeAgent] : [currentThought];
  const identity = activeAgent ? agentIdentities[activeAgent] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeAgent, currentThought]);

  return (
    <div className="glass-panel relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-2xl">
      {/* Top glow */}
      <div
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent"
        style={{
          backgroundImage: identity
            ? `linear-gradient(to right, transparent, ${identity.color}50, transparent)`
            : "linear-gradient(to right, transparent, rgba(6,182,212,0.3), transparent)"
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] p-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
            <Terminal className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold text-white">
              Neural Activity
            </h2>
            <p className="text-[10px] text-slate-500">Real-time agent consciousness</p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {activeAgent && identity && (
            <motion.div
              key={activeAgent}
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -8 }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                identity.borderClass,
                identity.bgClass,
                identity.textClass
              )}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className={cn("absolute h-full w-full rounded-full animate-ping opacity-50", identity.dotClass)} />
                <span className={cn("relative h-1.5 w-1.5 rounded-full", identity.dotClass)} />
              </span>
              {activeAgent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Log feed */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-1.5 overflow-y-auto p-3"
      >
        <AnimatePresence mode="popLayout">
          {lines.map((line, index) => {
            const AgentIcon = identity?.icon;
            return (
              <motion.div
                key={`${activeAgent ?? "idle"}-${line}-${index}`}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border p-2.5 text-sm",
                  activeAgent ? borderColorMap[activeAgent] : "border-white/[0.06]",
                  activeAgent ? bgColorMap[activeAgent] : "bg-white/[0.02]"
                )}
              >
                {/* Agent indicator */}
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded",
                    identity
                      ? `${identity.bgClass} ${identity.textClass}`
                      : "bg-cyan-500/10 text-cyan-400"
                  )}
                >
                  {AgentIcon ? (
                    <AgentIcon className="h-3 w-3" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <span className="font-mono text-xs leading-relaxed text-slate-300">
                    {activeAgent ? line : currentThought}
                  </span>
                </div>

                {/* Timestamp */}
                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-slate-600">
                  {String(index).padStart(2, "0")}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing cursor */}
        {activeAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-1 py-2"
          >
            <span className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full animate-bounce",
                    identity?.dotClass ?? "bg-cyan-400"
                  )}
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              neural processing
            </span>
          </motion.div>
        )}

        {/* Idle state */}
        {!activeAgent && !currentThought.includes("completed") && (
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <Terminal className="h-4 w-4 text-slate-600" />
              </span>
              <p className="text-xs text-slate-500">Awaiting neural activation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
