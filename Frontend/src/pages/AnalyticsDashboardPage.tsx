import { BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSwarmStore } from "@/store/swarmStore";
import { formatSeconds, wordCount } from "@/utils/format";

export function AnalyticsDashboardPage() {
  const { agents, results } = useSwarmStore();
  const data = agents.map((agent) => ({
    name: agent.name.replace(" Agent", ""),
    time: Number(agent.executionTime.toFixed(2)),
    confidence: Math.round(agent.confidence),
    throughput: Math.max(12, Math.round(agent.progress))
  }));
  const researchLength = results ? wordCount([results.research, results.factcheck, results.insights, results.summary].join(" ")) : 0;
  const verificationRate = results
    ? results.verifiedFacts.length > 0
      ? Math.min(100, Math.round((results.verifiedFacts.length / Math.max(results.verifiedFacts.length + results.keyInsights.length, 1)) * 100))
      : results.trustScore
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Processing Time", results ? formatSeconds(results.totalTime) : "0ms"],
          ["Trust Score", `${results?.trustScore ?? 0}%`],
          ["Research Length", `${researchLength} words`],
          ["Fact Verification", `${verificationRate}%`]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-bold text-white">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148, 163, 184, 0.22)", borderRadius: 8 }} />
                <Bar dataKey="confidence" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Processing Curve</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.14)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(148, 163, 184, 0.22)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="time" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4, fill: "#a78bfa" }} />
                <Line type="monotone" dataKey="throughput" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: "#34d399" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
