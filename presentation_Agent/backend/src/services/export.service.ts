import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import pptxgen from "pptxgenjs";
import type { PresentationDocument, SlideContent, Theme } from "../types/presentation.js";

function hexToPpt(hex: string) {
  return hex.replace("#", "").toUpperCase();
}

function hexToRgb(hex: string) {
  const normalized = hexToPpt(hex);
  const value = Number.parseInt(normalized, 16);
  return rgb(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function addFooter(slide: pptxgen.Slide, theme: Theme, page: number) {
  slide.addShape(pptxgen.ShapeType.line, {
    x: 0.6,
    y: 6.95,
    w: 12.1,
    h: 0,
    line: { color: hexToPpt(theme.muted), transparency: 65, width: 1 }
  });
  slide.addText(String(page).padStart(2, "0"), {
    x: 11.9,
    y: 7.02,
    w: 0.7,
    h: 0.2,
    fontFace: theme.fontFace,
    fontSize: 8,
    color: hexToPpt(theme.muted),
    align: "right"
  });
}

function addTitle(slide: pptxgen.Slide, theme: Theme, title: string, y = 0.65) {
  slide.addText(title, {
    x: 0.75,
    y,
    w: 11.8,
    h: 0.7,
    fontFace: theme.fontFace,
    fontSize: 28,
    bold: true,
    breakLine: false,
    fit: "shrink",
    color: hexToPpt(theme.text),
    margin: 0
  });
}

function addBullets(slide: pptxgen.Slide, theme: Theme, bullets: string[], x: number, y: number, w: number, h: number) {
  slide.addText(
    bullets.map((text) => ({ text, options: { bullet: { indent: 14 }, hanging: 4 } })),
    {
      x,
      y,
      w,
      h,
      fontFace: theme.fontFace,
      fontSize: 17,
      color: hexToPpt(theme.secondary),
      valign: "mid",
      breakLine: false,
      fit: "shrink"
    }
  );
}

function renderChart(slide: pptxgen.Slide, theme: Theme, content: SlideContent) {
  const chart = content.chart;
  if (!chart) return;
  const max = Math.max(...chart.values, 1);
  slide.addText(chart.title, {
    x: 0.9,
    y: 1.55,
    w: 11.2,
    h: 0.35,
    fontSize: 14,
    bold: true,
    color: hexToPpt(theme.secondary)
  });

  chart.labels.slice(0, 6).forEach((label, index) => {
    const value = chart.values[index] ?? 0;
    const barWidth = (value / max) * 8.5;
    const y = 2.1 + index * 0.65;
    slide.addText(label, { x: 0.95, y, w: 2.1, h: 0.25, fontSize: 11, color: hexToPpt(theme.text), fit: "shrink" });
    slide.addShape(pptxgen.ShapeType.rect, {
      x: 3.1,
      y,
      w: barWidth,
      h: 0.28,
      rectRadius: 0.05,
      fill: { color: index % 2 === 0 ? hexToPpt(theme.primary) : hexToPpt(theme.accent) },
      line: { color: index % 2 === 0 ? hexToPpt(theme.primary) : hexToPpt(theme.accent) }
    });
    slide.addText(String(value), { x: 11.7, y, w: 0.5, h: 0.25, fontSize: 10, color: hexToPpt(theme.muted), align: "right" });
  });
}

function renderSlide(pptx: pptxgen, doc: PresentationDocument, content: SlideContent, index: number) {
  const theme = doc.theme;
  const slide = pptx.addSlide();
  slide.background = { color: hexToPpt(theme.background) };

  slide.addShape(pptxgen.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.22,
    h: 7.5,
    fill: { color: hexToPpt(theme.primary) },
    line: { color: hexToPpt(theme.primary) }
  });

  if (content.layout === "title") {
    slide.addText(doc.title, {
      x: 0.85,
      y: 1.65,
      w: 10.9,
      h: 1.3,
      fontFace: theme.fontFace,
      fontSize: 38,
      bold: true,
      color: hexToPpt(theme.text),
      fit: "shrink",
      margin: 0
    });
    slide.addText(content.subtitle || doc.summary, {
      x: 0.9,
      y: 3.1,
      w: 9.8,
      h: 0.65,
      fontSize: 18,
      color: hexToPpt(theme.secondary),
      fit: "shrink"
    });
  } else if (content.layout === "two-column") {
    addTitle(slide, theme, content.title);
    slide.addShape(pptxgen.ShapeType.roundRect, { x: 0.85, y: 1.75, w: 5.35, h: 4.6, rectRadius: 0.12, fill: { color: hexToPpt(theme.surface) }, line: { color: "E5E7EB" } });
    slide.addShape(pptxgen.ShapeType.roundRect, { x: 6.55, y: 1.75, w: 5.35, h: 4.6, rectRadius: 0.12, fill: { color: hexToPpt(theme.surface) }, line: { color: "E5E7EB" } });
    slide.addText(content.leftTitle || "Now", { x: 1.15, y: 2.05, w: 4.7, h: 0.35, fontSize: 15, bold: true, color: hexToPpt(theme.primary) });
    slide.addText(content.rightTitle || "Next", { x: 6.85, y: 2.05, w: 4.7, h: 0.35, fontSize: 15, bold: true, color: hexToPpt(theme.accent) });
    addBullets(slide, theme, content.leftBullets || [], 1.15, 2.55, 4.55, 3.2);
    addBullets(slide, theme, content.rightBullets || [], 6.85, 2.55, 4.55, 3.2);
  } else if (content.layout === "quote") {
    addTitle(slide, theme, content.title);
    slide.addText(content.quote || content.subtitle || "", {
      x: 1.15,
      y: 2.05,
      w: 10.6,
      h: 2.8,
      fontSize: 28,
      italic: true,
      color: hexToPpt(theme.primary),
      fit: "shrink",
      valign: "mid"
    });
  } else if (content.layout === "chart") {
    addTitle(slide, theme, content.title);
    renderChart(slide, theme, content);
  } else {
    addTitle(slide, theme, content.title);
    if (content.subtitle) {
      slide.addText(content.subtitle, { x: 0.8, y: 1.4, w: 10.8, h: 0.35, fontSize: 14, color: hexToPpt(theme.muted), fit: "shrink" });
    }
    addBullets(slide, theme, content.bullets || [], 1.0, 2.0, 10.9, 3.8);
  }

  if (content.speakerNotes) {
    slide.addNotes(content.speakerNotes);
  }
  addFooter(slide, theme, index + 1);
}

export async function buildPptxBuffer(doc: PresentationDocument): Promise<Buffer> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Presentation Agent";
  pptx.company = "Presentation Agent";
  pptx.subject = doc.summary;
  pptx.title = doc.title;
  pptx.lang = "en-US";
  pptx.theme = {
    headFontFace: doc.theme.fontFace,
    bodyFontFace: doc.theme.fontFace,
    lang: "en-US"
  };

  doc.slides.forEach((slide, index) => renderSlide(pptx, doc, slide, index));
  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.from(output as ArrayBuffer);
}

export async function buildPdfBuffer(doc: PresentationDocument): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 1280;
  const height = 720;

  doc.slides.forEach((slideContent, index) => {
    const page = pdf.addPage([width, height]);
    page.drawRectangle({ x: 0, y: 0, width, height, color: hexToRgb(doc.theme.background) });
    page.drawRectangle({ x: 0, y: 0, width: 22, height, color: hexToRgb(doc.theme.primary) });
    page.drawText(slideContent.title || doc.title, {
      x: 78,
      y: 612,
      size: 34,
      font: bold,
      color: hexToRgb(doc.theme.text),
      maxWidth: 1060
    });

    const body =
      slideContent.layout === "two-column"
        ? [...(slideContent.leftBullets || []), ...(slideContent.rightBullets || [])]
        : slideContent.quote
          ? [slideContent.quote]
          : slideContent.bullets || [slideContent.subtitle || doc.summary];

    body.slice(0, 7).forEach((line, bodyIndex) => {
      page.drawText(`- ${line}`, {
        x: 92,
        y: 510 - bodyIndex * 52,
        size: 21,
        font: regular,
        color: hexToRgb(doc.theme.secondary),
        maxWidth: 1030,
        lineHeight: 28
      });
    });

    if (slideContent.chart) {
      const max = Math.max(...slideContent.chart.values, 1);
      slideContent.chart.labels.slice(0, 5).forEach((label, chartIndex) => {
        const value = slideContent.chart?.values[chartIndex] ?? 0;
        const y = 435 - chartIndex * 52;
        page.drawText(label, { x: 92, y, size: 15, font: regular, color: hexToRgb(doc.theme.text), maxWidth: 190 });
        page.drawRectangle({ x: 300, y: y - 4, width: (value / max) * 610, height: 22, color: hexToRgb(chartIndex % 2 === 0 ? doc.theme.primary : doc.theme.accent) });
      });
    }

    page.drawText(String(index + 1).padStart(2, "0"), {
      x: 1160,
      y: 34,
      size: 12,
      font: regular,
      color: hexToRgb(doc.theme.muted)
    });
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
