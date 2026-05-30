import { Download, FileDown, Presentation } from "lucide-react";
import { MarkdownCard } from "@/components/results/MarkdownCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { features } from "@/config/env";
import { useSwarmStore } from "@/store/swarmStore";

export function PresentationBuilderPage() {
  const results = useSwarmStore((state) => state.results);
  const slidePreview = results
    ? [
        results.presentation,
        results.summary && `## Summary\n\n${results.summary}`,
        results.insights && `## Insights\n\n${results.insights}`,
        results.factcheck && `## Verified Facts\n\n${results.factcheck}`
      ]
        .filter(Boolean)
        .join("\n\n")
    : "";
  const exportPdf = async () => {
    if (!results) return;
    const { exportResultsPdf } = await import("@/utils/exporters");
    exportResultsPdf(results);
  };
  const exportPpt = async () => {
    if (!results) return;
    const { exportResultsPpt } = await import("@/utils/exporters");
    await exportResultsPpt(results);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Presentation className="h-5 w-5 text-cyan-300" />
            <CardTitle>Presentation Builder</CardTitle>
          </div>
          <p className="text-sm text-slate-400">Generate boardroom-ready assets from the latest swarm output.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" disabled={!results || !features.exports} onClick={() => void exportPdf()}>
            <FileDown className="h-5 w-5" /> Export PDF
          </Button>
          <Button className="w-full" variant="secondary" disabled={!results || !features.exports} onClick={() => void exportPpt()}>
            <Download className="h-5 w-5" /> Export PPT
          </Button>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
            Exports use only the latest backend response, including topic metadata, trust score, and generated sections.
          </div>
          {!features.exports && (
            <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-100">
              Exports are disabled by VITE_ENABLE_EXPORTS.
            </div>
          )}
        </CardContent>
      </Card>
      <MarkdownCard title="Slide Narrative" content={slidePreview} />
    </div>
  );
}
