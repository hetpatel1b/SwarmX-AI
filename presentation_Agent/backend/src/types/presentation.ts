export type VisualStyle = "modern" | "minimal" | "executive" | "bold" | "academic";

export interface GeneratePresentationInput {
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

export interface Theme {
  name: string;
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  fontFace: string;
}

export interface SlideContent {
  id: string;
  layout: "title" | "section" | "bullets" | "two-column" | "quote" | "chart" | "closing";
  title: string;
  subtitle?: string;
  bullets?: string[];
  leftTitle?: string;
  leftBullets?: string[];
  rightTitle?: string;
  rightBullets?: string[];
  chart?: {
    title: string;
    labels: string[];
    values: number[];
  };
  quote?: string;
  speakerNotes?: string;
  visualPrompt?: string;
}

export interface PresentationDocument {
  title: string;
  summary: string;
  theme: Theme;
  slides: SlideContent[];
}
