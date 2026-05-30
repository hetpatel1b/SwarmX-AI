import { z } from "zod";
import { env } from "../config/env.js";
import type { GeneratePresentationInput, PresentationDocument } from "../types/presentation.js";
import { completeJson } from "./groq.service.js";
import { getTheme } from "./theme.service.js";

const slideSchema = z.object({
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
      labels: z.array(z.string()).min(2).max(6),
      values: z.array(z.number()).min(2).max(6)
    })
    .optional(),
  quote: z.string().optional(),
  speakerNotes: z.string().optional(),
  visualPrompt: z.string().optional()
});

const aiResponseSchema = z.object({
  title: z.string(),
  summary: z.string(),
  slides: z.array(slideSchema)
});

function buildSystemPrompt() {
  return [
    "You are a senior presentation strategist and slide content generator.",
    "Return only valid JSON.",
    "Create concise, presentation-ready content with dynamic slide layouts.",
    "Do not include markdown fences.",
    "Every slide should have speakerNotes when requested.",
    "Use short titles, useful bullets, and credible business framing."
  ].join(" ");
}

function buildUserPrompt(input: GeneratePresentationInput) {
  return JSON.stringify({
    task: "Generate a presentation document.",
    constraints: {
      slideCount: Math.min(input.slideCount, env.MAX_SLIDE_COUNT),
      audience: input.audience,
      tone: input.tone,
      language: input.language,
      visualStyle: input.visualStyle,
      includeSpeakerNotes: input.includeSpeakerNotes,
      includeCharts: input.includeCharts,
      allowedLayouts: ["title", "section", "bullets", "two-column", "quote", "chart", "closing"]
    },
    outputShape: {
      title: "string",
      summary: "string",
      slides: [
        {
          layout: "title | section | bullets | two-column | quote | chart | closing",
          title: "string",
          subtitle: "string optional",
          bullets: ["string optional"],
          leftTitle: "string optional",
          leftBullets: ["string optional"],
          rightTitle: "string optional",
          rightBullets: ["string optional"],
          chart: "{ title, labels, values } optional",
          quote: "string optional",
          speakerNotes: "string optional",
          visualPrompt: "string optional"
        }
      ]
    },
    topic: input.topic,
    sourceMaterial: input.sourceMaterial || "No source material provided."
  });
}

export async function generatePresentation(input: GeneratePresentationInput): Promise<PresentationDocument> {
  const content = await completeJson(buildSystemPrompt(), buildUserPrompt(input));
  const parsedJson = JSON.parse(content) as unknown;
  const parsed = aiResponseSchema.parse(parsedJson);
  const slides = parsed.slides.slice(0, input.slideCount).map((slide, index) => ({
    id: `slide-${index + 1}`,
    ...slide,
    speakerNotes: input.includeSpeakerNotes ? slide.speakerNotes || `Discuss ${slide.title}.` : undefined
  }));

  return {
    title: parsed.title,
    summary: parsed.summary,
    theme: getTheme(input.visualStyle),
    slides
  };
}
