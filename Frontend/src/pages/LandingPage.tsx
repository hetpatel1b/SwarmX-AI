import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, CheckCircle2, Cpu, Network, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PageKey } from "@/layouts/AppLayout";

export function LandingPage({ onNavigate }: { onNavigate: (page: PageKey) => void }) {
  const capabilities = [
    { icon: BrainCircuit, label: "Deep research", text: "Autonomous source gathering and synthesis." },
    { icon: ShieldCheck, label: "Verification", text: "Claim checks, consistency scoring, and trust signals." },
    { icon: Network, label: "Agent graph", text: "Observable collaboration across specialized agents." },
    { icon: Cpu, label: "Presentation output", text: "Summaries and export-ready slide narratives." }
  ];

  return (
    <div className="space-y-8">
      <section className="grid min-h-[calc(100vh-130px)] items-center gap-8 py-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5 text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
            Microsoft Build AI Agent Swarms
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-5xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl"
          >
            SwarmX AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-slate-300"
          >
            An autonomous multi-agent intelligence platform where research, verification, insight generation,
            summarization, and presentation creation move as one coordinated swarm.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" onClick={() => onNavigate("workspace")}>
              Run Swarm <ArrowRight className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => onNavigate("agents")}>
              View Agent Graph
            </Button>
          </motion.div>
        </div>
        <Card className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
          <div className="grid gap-4">
            {capabilities.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + index * 0.08 }}
                  className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.06] p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cyan-300/12 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{item.label}</h3>
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-400">{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}
