import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Terminal } from "lucide-react";
import type { AgentId } from "@/types/swarm";
import { thinkingScripts, agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

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
    <div className="glass-panel relative flex h-full flex-col overflow-hidden rounded-2xl">
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
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <h2 className="font-display text-sm font-semibold text-white">
            AI Consciousness Feed
          </h2>
        </div>
        {activeAgent && identity && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
              identity.borderClass,
              identity.bgClass,
              identity.textClass
            )}
          >
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            {activeAgent}
          </motion.div>
        )}
      </div>

      {/* Log feed */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-2 overflow-y-auto px-4 pb-4"
      >
        <AnimatePresence mode="popLayout">
          {lines.map((line, index) => {
            const AgentIcon = identity?.icon;
            return (
              <motion.div
                key={`${activeAgent ?? "idle"}-${line}-${index}`}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-sm",
                  identity
                    ? `border-${identity.id === "research" ? "cyan" : identity.id === "factcheck" ? "emerald" : identity.id === "insights" ? "violet" : identity.id === "summary" ? "amber" : "rose"}-500/10 bg-${identity.id === "research" ? "cyan" : identity.id === "factcheck" ? "emerald" : identity.id === "insights" ? "violet" : identity.id === "summary" ? "amber" : "rose"}-500/[0.03]`
                    : "border-white/[0.06] bg-white/[0.02]"
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
                  <span className="font-mono text-xs text-slate-300">
                    {activeAgent ? line : currentThought}
                  </span>
                </div>

                {/* Timestamp-like indicator */}
                <span className="shrink-0 font-mono text-[10px] text-slate-600">
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
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-bounce",
                  identity?.dotClass ?? "bg-cyan-400"
                )}
                style={{ animationDelay: "0ms" }}
              />
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-bounce",
                  identity?.dotClass ?? "bg-cyan-400"
                )}
                style={{ animationDelay: "150ms" }}
              />
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-bounce",
                  identity?.dotClass ?? "bg-cyan-400"
                )}
                style={{ animationDelay: "300ms" }}
              />
            </span>
            <span className="font-mono text-xs text-slate-500">
              processing
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
