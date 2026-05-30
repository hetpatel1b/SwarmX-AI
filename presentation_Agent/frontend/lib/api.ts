export type VisualStyle = "modern" | "minimal" | "executive" | "bold" | "academic";

export interface GenerateRequest {
  topic: string;
  audience: string;
  tone: string;
  slideCount: number;
  language: string;
  visualStyle: VisualStyle;
  includeSpeakerNotes: boolean;
  includeCharts: boolean;
  sourceMaterial?: string;
}

export interface PresentationDocument {
  title: string;
  summary: string;
  theme: {
    name: string;
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
    fontFace: string;
  };
  slides: Array<{
    id: string;
    layout: string;
    title: string;
    subtitle?: string;
    bullets?: string[];
    leftTitle?: string;
    leftBullets?: string[];
    rightTitle?: string;
    rightBullets?: string[];
    quote?: string;
    speakerNotes?: string;
    chart?: {
      title: string;
      labels: string[];
      values: number[];
    };
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    return body.error?.message || "Request failed.";
  } catch {
    return "Request failed.";
  }
}

export async function generatePresentation(payload: GenerateRequest) {
  const response = await fetch(`${API_URL}/api/presentations/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error(await parseError(response));
  const body = (await response.json()) as { presentation: PresentationDocument };
  return body.presentation;
}

export async function downloadExport(presentation: PresentationDocument, format: "pptx" | "pdf") {
  const response = await fetch(`${API_URL}/api/presentations/export/${format}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presentation })
  });

  if (!response.ok) throw new Error(await parseError(response));

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const fallback = `presentation.${format}`;
  const fileName = disposition?.match(/filename="([^"]+)"/)?.[1] || fallback;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
