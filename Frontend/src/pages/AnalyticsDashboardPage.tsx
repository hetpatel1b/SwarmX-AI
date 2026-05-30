import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Cell
} from "recharts";
import {
  Activity,
  Clock,
  FileText,
  Gauge,
  Shield,
  TrendingUp,
  Zap
} from "lucide-react";
import { useSwarmStore } from "@/store/swarmStore";
import { formatSeconds, wordCount } from "@/utils/format";
import { agentIdentities } from "@/utils/agents";
import { cn } from "@/lib/utils";

const tooltipStyle = {
  background: "rgba(3, 7, 18, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.1)",
  borderRadius: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  fontSize: 12,
  color: "#e2e8f0",
  padding: "8px 12px"
};

export function AnalyticsDashboardPage() {
  const { agents, results } = useSwarmStore();
  const data = agents.map((agent) => {
    const identity = agentIdentities[agent.id];
    return {
      name: agent.name.replace(" Agent", ""),
      time: Number(agent.executionTime.toFixed(2)),
      confidence: Math.round(agent.confidence),
      throughput: Math.max(12, Math.round(agent.progress)),
      fill: identity.color
    };
  });

  const researchLength = results
    ? wordCount(
        [results.research, results.factcheck, results.insights, results.summary].join(
          " "
        )
      )
    : 0;
  const verificationRate = results
    ? results.verifiedFacts.length > 0
      ? Math.min(
          100,
          Math.round(
            (results.verifiedFacts.length /
              Math.max(
                results.verifiedFacts.length + results.keyInsights.length,
                1
              )) *
              100
          )
        )
      : results.trustScore
    : 0;

  const metricCards = [
    {
      label: "Processing Time",
      value: results ? formatSeconds(results.totalTime) : "—",
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
    },
    {
      label: "Trust Score",
      value: results ? `${results.trustScore}%` : "—",
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
    },
    {
      label: "Knowledge Output",
      value: researchLength > 0 ? `${researchLength}` : "—",
      suffix: researchLength > 0 ? "words" : undefined,
      icon: FileText,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]"
    },
    {
      label: "Verification Rate",
      value: verificationRate > 0 ? `${verificationRate}%` : "—",
      icon: Gauge,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.1)]"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Swarm Intelligence
            </h1>
            <p className="text-sm text-slate-400">
              Performance telemetry and agent collaboration analytics
            </p>
          </div>
        </div>

        {results && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:flex"
          >
            <Shield className="h-3 w-3" />
            Trust: {results.trustScore}%
          </motion.div>
        )}
      </motion.div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -3 }}
              className={cn(
                "glass-panel group relative overflow-hidden rounded-xl p-5 transition-all duration-300",
                m.glow
              )}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${m.border} ${m.bg} ${m.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    {m.label}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <p className="font-display text-2xl font-bold tracking-tight text-white">
                      {m.value}
                    </p>
                    {"suffix" in m && m.suffix && (
                      <span className="text-xs text-slate-500">{m.suffix}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent Confidence — Per-agent colored bars */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <h2 className="font-display text-sm font-semibold text-white">
                Agent Confidence
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-600">Per agent</span>
          </div>
          <div className="h-72 px-3 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="18%">
                <CartesianGrid
                  stroke="rgba(148, 163, 184, 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="#475569"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  domain={[0, 100]}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(148,163,184,0.03)" }} />
                <Bar
                  dataKey="confidence"
                  radius={[8, 8, 2, 2]}
                  fillOpacity={0.85}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Processing Curve */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
          <div className="flex items-center justify-between p-5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-400" />
              <h2 className="font-display text-sm font-semibold text-white">
                Processing Curve
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-600">Time & throughput</span>
          </div>
          <div className="h-72 px-3 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gradViolet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEmerald" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(148, 163, 184, 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#475569"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="#475569"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="time"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#gradViolet)"
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#8b5cf640", strokeWidth: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="throughput"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradEmerald)"
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#10b98140", strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Agent Collaboration Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="font-display text-sm font-semibold text-white">
            Agent Collaboration Grid
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-slate-600">
            {agents.filter((a) => a.status === "Completed").length}/{agents.length} complete
          </span>
        </div>
        <div className="grid gap-px overflow-hidden rounded-b-2xl bg-white/[0.03] sm:grid-cols-5">
          {agents.map((agent, i) => {
            const identity = agentIdentities[agent.id];
            const Icon = identity.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                className="flex flex-col items-center gap-2.5 bg-[#030712] p-5 text-center transition-colors"
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-300",
                    identity.borderClass,
                    identity.bgClass,
                    identity.textClass,
                    agent.status === "Completed" && "shadow-sm"
                  )}
                  style={agent.status === "Completed" ? { boxShadow: `0 0 16px ${identity.color}15` } : {}}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-xs font-medium text-slate-400">
                  {agent.name.replace(" Agent", "")}
                </p>
                <p className="font-display text-2xl font-bold text-white">
                  {agent.confidence > 0 ? `${Math.round(agent.confidence)}%` : "—"}
                </p>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                    agent.status === "Running" && `${identity.bgClass} ${identity.textClass}`,
                    agent.status === "Completed" && "bg-emerald-500/10 text-emerald-400",
                    agent.status === "Failed" && "bg-red-500/10 text-red-400",
                    agent.status === "Idle" && "bg-white/[0.04] text-slate-600"
                  )}
                >
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full",
                      agent.status === "Running" && `${identity.dotClass} animate-pulse`,
                      agent.status === "Completed" && "bg-emerald-400",
                      agent.status === "Failed" && "bg-red-400",
                      agent.status === "Idle" && "bg-slate-600"
                    )}
                  />
                  {agent.status}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
