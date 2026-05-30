import { z } from "zod";

export const generatePresentationSchema = z.object({
  topic: z.string().min(3).max(180),
  audience: z.string().min(2).max(120).default("general business audience"),
  tone: z.string().min(2).max(80).default("clear and persuasive"),
  slideCount: z.coerce.number().int().min(3).max(30).default(8),
  language: z.string().min(2).max(40).default("English"),
  visualStyle: z.enum(["modern", "minimal", "executive", "bold", "academic"]).default("modern"),
  includeSpeakerNotes: z.coerce.boolean().default(true),
  includeCharts: z.coerce.boolean().default(true),
  sourceMaterial: z.string().max(20_000).optional()
});

export const exportPresentationSchema = z.object({
  presentation: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    theme: z.object({
      name: z.string(),
      background: z.string(),
      surface: z.string(),
      primary: z.string(),
      secondary: z.string(),
      accent: z.string(),
      text: z.string(),
      muted: z.string(),
      fontFace: z.string()
    }),
    slides: z.array(
      z.object({
        id: z.string(),
        layout: z.enum(["title", "section", "bullets", "two-column", "quote", "chart", "closing"]),
        title: z.string(),
        subtitle: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        leftTitle: z.string().optional(),
        leftBullets: z.array(z.string()).optional(),
        rightTitle: z.string().optional(),
        rightBullets: z.array(z.string()).optional(),
        chart: z
          .object({
            title: z.string(),
            labels: z.array(z.string()),
            values: z.array(z.number())
          })
          .optional(),
        quote: z.string().optional(),
        speakerNotes: z.string().optional(),
        visualPrompt: z.string().optional()
      })
    )
  })
});

export type GeneratePresentationBody = z.infer<typeof generatePresentationSchema>;
export type ExportPresentationBody = z.infer<typeof exportPresentationSchema>;
