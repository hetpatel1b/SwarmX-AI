import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  cyan: "from-cyan-400 via-cyan-300 to-sky-400",
  emerald: "from-emerald-400 via-emerald-300 to-teal-400",
  violet: "from-violet-400 via-purple-300 to-indigo-400",
  amber: "from-amber-400 via-yellow-300 to-orange-400",
  rose: "from-rose-400 via-pink-300 to-red-400",
  default: "from-cyan-300 via-sky-400 to-violet-400"
};

const glowColorMap: Record<string, string> = {
  cyan: "shadow-[0_0_12px_rgba(6,182,212,0.4)]",
  emerald: "shadow-[0_0_12px_rgba(16,185,129,0.4)]",
  violet: "shadow-[0_0_12px_rgba(139,92,246,0.4)]",
  amber: "shadow-[0_0_12px_rgba(245,158,11,0.4)]",
  rose: "shadow-[0_0_12px_rgba(244,63,94,0.4)]",
  default: "shadow-[0_0_12px_rgba(6,182,212,0.3)]"
};

export function Progress({
  value,
  className,
  color = "default"
}: {
  value: number;
  className?: string;
  color?: "cyan" | "emerald" | "violet" | "amber" | "rose" | "default";
}) {
  const clampedValue = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
          colorMap[color],
          clampedValue > 0 && glowColorMap[color]
        )}
        style={{ width: `${clampedValue}%` }}
      />
      {clampedValue > 0 && clampedValue < 100 && (
        <div
          className="absolute top-0 h-full w-8 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ left: `${Math.max(0, clampedValue - 6)}%` }}
        />
      )}
    </div>
  );
}
