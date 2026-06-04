export interface Slide {
  slideNumber: number;
  title: string;
  bullets: string[];
  speakerNotes: string;
}

export interface PresentationData {
  title?: string;
  executiveSummary?: string;
  slides: Slide[];
  keyFindings?: string[];
  conclusion?: string;
}

export function parsePresentationJson(payload: any): PresentationData {
  let parsed: any = null;

  if (typeof payload === "object" && payload !== null) {
    parsed = payload;
  } else if (typeof payload === "string") {
    try {
      if (payload.includes("- {") || payload.trim().startsWith("{")) {
        const extractedSlides: Slide[] = [];
        const lines = payload.split("\n");
        for (let line of lines) {
          line = line.trim();
          if (line.startsWith("- ")) line = line.substring(2);
          if (line.startsWith("{") && line.endsWith("}")) {
            try {
              extractedSlides.push(JSON.parse(line));
            } catch (e) {}
          }
        }
        if (extractedSlides.length > 0) {
          parsed = { slides: extractedSlides };
        }
      }

      if (!parsed) {
        parsed = JSON.parse(payload);
      }
    } catch (error) {
      console.warn("Presentation Parse Error:", error);
      return { slides: [] };
    }
  } else {
    return { slides: [] };
  }

  const slidesRaw = Array.isArray(parsed) ? parsed : (parsed?.slides || parsed?.data?.slides || []);
  
  const validatedSlides: Slide[] = slidesRaw.map((s: any, idx: number) => ({
    slideNumber: typeof s?.slideNumber === "number" ? s.slideNumber : idx + 1,
    title: typeof s?.title === "string" ? s.title : `Slide ${idx + 1}`,
    bullets: Array.isArray(s?.bullets) ? s.bullets.filter((b: any) => typeof b === "string") : [],
    speakerNotes: typeof s?.speakerNotes === "string" ? s.speakerNotes : ""
  }));

  return {
    title: typeof parsed?.title === "string" ? parsed.title : typeof parsed?.data?.title === "string" ? parsed.data.title : undefined,
    executiveSummary: typeof parsed?.executiveSummary === "string" ? parsed.executiveSummary : typeof parsed?.data?.executiveSummary === "string" ? parsed.data.executiveSummary : undefined,
    slides: validatedSlides,
    keyFindings: Array.isArray(parsed?.keyFindings) ? parsed.keyFindings : Array.isArray(parsed?.data?.keyFindings) ? parsed.data.keyFindings : undefined,
    conclusion: typeof parsed?.conclusion === "string" ? parsed.conclusion : typeof parsed?.data?.conclusion === "string" ? parsed.data.conclusion : undefined,
  };
}
