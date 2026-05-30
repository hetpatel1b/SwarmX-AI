import { useState } from "react";
import type { ReactNode } from "react";
import { AgentDashboardPage } from "@/pages/AgentDashboardPage";
import { AnalyticsDashboardPage } from "@/pages/AnalyticsDashboardPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { appName, envValidationErrors } from "@/config/env";
import { LandingPage } from "@/pages/LandingPage";
import { PresentationBuilderPage } from "@/pages/PresentationBuilderPage";
import { ResultsExplorerPage } from "@/pages/ResultsExplorerPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { AppLayout, type PageKey } from "@/layouts/AppLayout";

export function App() {
  const [page, setPage] = useState<PageKey>("landing");

  if (envValidationErrors.length > 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{appName || "SwarmX AI"} configuration error</CardTitle>
            <p className="text-sm text-slate-400">
              The frontend cannot start until the required environment variables are configured.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {envValidationErrors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
            <Button type="button" onClick={() => window.location.reload()}>
              Reload after fixing .env
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const pages: Record<PageKey, ReactNode> = {
    landing: <LandingPage onNavigate={setPage} />,
    workspace: <WorkspacePage />,
    agents: <AgentDashboardPage />,
    results: <ResultsExplorerPage />,
    presentation: <PresentationBuilderPage />,
    analytics: <AnalyticsDashboardPage />
  };

  return (
    <AppLayout page={page} onNavigate={setPage}>
      {pages[page]}
    </AppLayout>
  );
}
