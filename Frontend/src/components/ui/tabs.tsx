import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 backdrop-blur-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "relative min-h-9 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors duration-200",
            active === tab
              ? "text-white"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          {active === tab && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 rounded-lg bg-white/[0.1] border border-white/[0.08] shadow-[0_0_20px_rgba(6,182,212,0.15)]"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
