import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Blocks,
  Bot,
  FileText,
  Menu,
  Presentation,
  Sparkles,
  X
} from "lucide-react";
import { BackendStatus } from "@/components/system/BackendStatus";
import { NeuralBackground } from "@/components/system/NeuralBackground";
import { PageTransition } from "@/components/system/PageTransition";
import { appName } from "@/config/env";
import { cn } from "@/lib/utils";

export type PageKey =
  | "landing"
  | "workspace"
  | "agents"
  | "results"
  | "presentation"
  | "analytics";

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
] satisfies Array<{ key: PageKey; label: string; icon: typeof Sparkles }>;

export function AppLayout({ page, onNavigate, children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (target: PageKey) => {
    onNavigate(target);
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen">
      <NeuralBackground />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#030712]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("landing")}
            className="flex min-w-fit items-center gap-3 rounded-lg text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Go to SwarmX AI home"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-300 shadow-glow">
              <Sparkles className="h-5 w-5 text-slate-950" />
              {/* Orbital ring */}
              <span className="absolute -inset-1 animate-orbit rounded-full border border-cyan-400/20" />
            </span>
            <span className="hidden sm:block">
              <span className="block font-display text-sm font-bold tracking-tight text-white">
                {appName}
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/70">
                Neural Nexus
              </span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden items-center gap-3 md:flex">
            <BackendStatus />
            <nav className="flex rounded-xl border border-white/[0.06] bg-white/[0.03] p-1 backdrop-blur-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = page === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.key)}
                    className={cn(
                      "relative flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "text-white"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                    title={item.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.06]"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 28
                        }}
                      />
                    )}
                    <Icon className="relative z-10 h-4 w-4" />
                    <span className="relative z-10 hidden lg:inline">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <BackendStatus />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/[0.06] bg-[#030712]/90 backdrop-blur-2xl md:hidden"
            >
              <div className="grid gap-1 p-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navigate(item.key)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition",
                        page === item.key
                          ? "bg-white/[0.08] text-white"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <PageTransition pageKey={page}>{children}</PageTransition>
      </main>
    </div>
  );
}
