import { useState, lazy, Suspense, useCallback } from "react";
import { appName, envValidationErrors } from "@/config/env";
import { AppLayout, type PageKey } from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Lazy load all pages for code splitting
const LandingPage = lazy(() => import("@/pages/LandingPage").then(m => ({ default: m.LandingPage })));
const WorkspacePage = lazy(() => import("@/pages/WorkspacePage").then(m => ({ default: m.WorkspacePage })));
const AgentDashboardPage = lazy(() => import("@/pages/AgentDashboardPage").then(m => ({ default: m.AgentDashboardPage })));
const ResultsExplorerPage = lazy(() => import("@/pages/ResultsExplorerPage").then(m => ({ default: m.ResultsExplorerPage })));
const PresentationBuilderPage = lazy(() => import("@/pages/PresentationBuilderPage").then(m => ({ default: m.PresentationBuilderPage })));
const AnalyticsDashboardPage = lazy(() => import("@/pages/AnalyticsDashboardPage").then(m => ({ default: m.AnalyticsDashboardPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute h-full w-full rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">Loading module</p>
      </div>
    </div>
  );
}

function renderPage(page: PageKey, onNavigate: (page: PageKey) => void) {
  switch (page) {
    case "landing": return <LandingPage onNavigate={onNavigate} />;
    case "workspace": return <WorkspacePage />;
    case "agents": return <AgentDashboardPage />;
    case "results": return <ResultsExplorerPage />;
    case "presentation": return <PresentationBuilderPage />;
    case "analytics": return <AnalyticsDashboardPage />;
    default: return <LandingPage onNavigate={onNavigate} />;
  }
}

export function App() {
  const [page, setPage] = useState<PageKey>("landing");
  const handleNavigate = useCallback((p: PageKey) => setPage(p), []);

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

  return (
    <AppLayout page={page} onNavigate={handleNavigate}>
      <Suspense fallback={<PageLoader />}>
        {renderPage(page, handleNavigate)}
      </Suspense>
    </AppLayout>
  );
}
