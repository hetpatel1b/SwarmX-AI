import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BarChart3, Blocks, Bot, FileText, LayoutDashboard, Presentation, Sparkles } from "lucide-react";
import { BackendStatus } from "@/components/system/BackendStatus";
import { appName } from "@/config/env";
import { cn } from "@/lib/utils";

export type PageKey = "landing" | "workspace" | "agents" | "results" | "presentation" | "analytics";

interface AppLayoutProps {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
}

const navItems = [
  { key: "landing", label: "Home", icon: Sparkles },
  { key: "workspace", label: "Workspace", icon: Bot },
  { key: "agents", label: "Agents", icon: Blocks },
  { key: "results", label: "Results", icon: FileText },
  { key: "presentation", label: "Slides", icon: Presentation },
  { key: "analytics", label: "Analytics", icon: BarChart3 }
] satisfies Array<{ key: PageKey; label: string; icon: typeof LayoutDashboard }>;

export function AppLayout({ page, onNavigate, children }: AppLayoutProps) {
  return (
    <div className="min-h-screen subtle-grid">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#05070d]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="flex min-w-fit items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Go to SwarmX AI home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300 text-slate-950 shadow-glow">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-white">{appName}</span>
              <span className="hidden text-xs text-slate-400 sm:block">Autonomous multi-agent intelligence</span>
            </span>
          </button>
          <div className="flex items-center gap-2 overflow-hidden">
            <BackendStatus />
            <nav className="flex max-w-[58vw] gap-1 overflow-x-auto rounded-md border border-white/10 bg-white/[0.06] p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className={cn(
                      "flex h-9 min-w-9 items-center justify-center gap-2 rounded px-3 text-sm font-medium text-slate-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      page === item.key ? "bg-white text-slate-950" : "hover:bg-white/10 hover:text-white"
                    )}
                    title={item.label}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <motion.main
        key={page}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
