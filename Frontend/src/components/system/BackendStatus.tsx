import { motion } from "framer-motion";
import { Activity, Server, ServerOff, RefreshCw } from "lucide-react";
import { apiBaseUrl } from "@/config/env";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { cn } from "@/lib/utils";

export function BackendStatus() {
  const { status, error, checkedAt, refresh } = useBackendHealth();
  const online = status === "online";
  const checking = status === "checking";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex min-h-8 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300",
        online && "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300",
        checking && "border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-300",
        status === "offline" && "border-red-500/20 bg-red-500/[0.08] text-red-300"
      )}
      title={error ?? `Backend: ${apiBaseUrl}${checkedAt ? ` | Checked ${checkedAt.toLocaleTimeString()}` : ""}`}
    >
      {/* Pulse dot */}
      <span className="relative flex h-2 w-2">
        {online && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            online && "bg-emerald-400",
            checking && "bg-cyan-400 animate-pulse",
            status === "offline" && "bg-red-400"
          )}
        />
      </span>

      {online ? (
        <Activity className="h-3 w-3" />
      ) : (
        status === "offline" ? <ServerOff className="h-3 w-3" /> : <Server className="h-3 w-3" />
      )}

      <span className="hidden sm:inline">
        {checking ? "Connecting" : online ? "Systems Online" : "Offline"}
      </span>

      <button
        type="button"
        onClick={() => void refresh()}
        className="rounded-full p-0.5 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="Refresh backend status"
      >
        <RefreshCw className={cn("h-3 w-3", checking && "animate-spin")} />
      </button>
    </motion.div>
  );
}
