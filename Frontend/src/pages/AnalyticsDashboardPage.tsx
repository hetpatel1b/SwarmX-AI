import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart
} from "recharts";
import {
  Activity,
  Clock,
  FileText,
  Gauge,
  Shield,
  Zap
} from "lucide-react";
import { useSwarmStore } from "@/store/swarmStore";
import { formatSeconds, wordCount } from "@/utils/format";
import { agentIdentities } from "@/utils/agents";

const tooltipStyle = {
  background: "rgba(3, 7, 18, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.12)",
  borderRadius: 12,
  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  fontSize: 12,
  color: "#e2e8f0"
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
      value: results ? formatSeconds(results.totalTime) : "0ms",
      icon: Clock,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      label: "Trust Score",
      value: `${results?.trustScore ?? 0}%`,
      icon: Shield,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      label: "Knowledge Density",
      value: `${researchLength} words`,
      icon: FileText,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20"
    },
    {
      label: "Fact Verification",
      value: `${verificationRate}%`,
      icon: Gauge,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
          <Activity className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Swarm Intelligence
          </h1>
          <p className="text-sm text-slate-400">
            Performance analytics, trust metrics, and agent collaboration data
          </p>
        </div>
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
              className="glass-panel group relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:border-white/[0.15]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${m.border} ${m.bg} ${m.color}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    {m.label}
                  </p>
                  <p className="font-display text-2xl font-bold tracking-tight text-white">
                    {m.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent Confidence */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <h2 className="font-display text-base font-semibold text-white">
                Agent Confidence
              </h2>
            </div>
          </div>
          <div className="h-72 px-3 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid
                  stroke="rgba(148, 163, 184, 0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(148,163,184,0.04)" }} />
                <Bar
                  dataKey="confidence"
                  radius={[8, 8, 0, 0]}
                  fill="#06b6d4"
                  fillOpacity={0.8}
                />
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
          <div className="p-5 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-400" />
              <h2 className="font-display text-base font-semibold text-white">
                Processing Curve
              </h2>
            </div>
          </div>
          <div className="h-72 px-3 pb-5">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="gradViolet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="gradEmerald"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(148, 163, 184, 0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <YAxis
                  stroke="#64748b"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="time"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fill="url(#gradViolet)"
                  dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="throughput"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#gradEmerald)"
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Collaboration metrics */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
        <div className="p-5 pb-3">
          <h2 className="font-display text-base font-semibold text-white">
            Agent Collaboration Metrics
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-b-2xl bg-white/[0.04] sm:grid-cols-5">
          {agents.map((agent) => {
            const identity = agentIdentities[agent.id];
            const Icon = identity.icon;
            return (
              <div
                key={agent.id}
                className="flex flex-col items-center gap-2 bg-[#030712] p-5 text-center"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${identity.borderClass} ${identity.bgClass} ${identity.textClass}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-xs font-medium text-slate-400">
                  {agent.name.replace(" Agent", "")}
                </p>
                <p className="font-display text-xl font-bold text-white">
                  {Math.round(agent.confidence)}%
                </p>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {agent.status}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
