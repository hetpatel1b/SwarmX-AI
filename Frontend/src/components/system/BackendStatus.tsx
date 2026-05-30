import { RefreshCw, Server, ServerOff } from "lucide-react";
import { apiBaseUrl } from "@/config/env";
import { useBackendHealth } from "@/hooks/useBackendHealth";
import { cn } from "@/lib/utils";

export function BackendStatus() {
  const { status, error, checkedAt, refresh } = useBackendHealth();
  const online = status === "online";
  const checking = status === "checking";
  const Icon = online ? Server : ServerOff;

  return (
    <div
      className={cn(
        "flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium",
        online && "border-emerald-300/30 bg-emerald-400/10 text-emerald-100",
        checking && "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
        status === "offline" && "border-red-300/30 bg-red-400/10 text-red-100"
      )}
      title={error ?? `Backend: ${apiBaseUrl}${checkedAt ? ` | Last checked ${checkedAt.toLocaleTimeString()}` : ""}`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{checking ? "Checking backend" : online ? "Backend online" : "Backend offline"}</span>
      <button
        type="button"
        onClick={() => void refresh()}
        className="rounded p-1 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Refresh backend status"
      >
        <RefreshCw className={cn("h-3.5 w-3.5", checking && "animate-spin")} />
      </button>
    </div>
  );
}
