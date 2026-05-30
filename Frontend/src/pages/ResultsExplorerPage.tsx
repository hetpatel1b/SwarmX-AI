import { useState } from "react";
import { MarkdownCard } from "@/components/results/MarkdownCard";
import { Tabs } from "@/components/ui/tabs";
import { useSwarmStore } from "@/store/swarmStore";

export function ResultsExplorerPage() {
  const [active, setActive] = useState("Research");
  const results = useSwarmStore((state) => state.results);
  const content = {
    Research: results?.research ?? "",
    "Fact Check": results?.factcheck ?? "",
    Insights: results?.insights ?? "",
    Summary: results?.summary ?? ""
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Results Explorer</h1>
          <p className="mt-2 text-slate-400">{results?.topic ?? "Run the swarm to populate research outputs."}</p>
        </div>
        <Tabs tabs={Object.keys(content)} active={active} onChange={setActive} />
      </div>
      <MarkdownCard title={active} content={content[active as keyof typeof content]} />
    </div>
  );
}
