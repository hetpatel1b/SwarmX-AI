import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "cyan" | "emerald" | "violet" | "amber" | "rose";
}

const glowMap = {
  cyan: "neural-glow-cyan",
  emerald: "neural-glow-emerald",
  violet: "neural-glow-violet",
  amber: "neural-glow-amber",
  rose: "neural-glow-rose"
} as const;

const borderColorMap = {
  cyan: "border-cyan-500/20",
  emerald: "border-emerald-500/20",
  violet: "border-violet-500/20",
  amber: "border-amber-500/20",
  rose: "border-rose-500/20"
} as const;

export function Card({ className, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-xl transition-all duration-300 hover:border-white/[0.15]",
        glow && glowMap[glow],
        glow && borderColorMap[glow],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5 p-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display text-base font-semibold tracking-tight text-white", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
