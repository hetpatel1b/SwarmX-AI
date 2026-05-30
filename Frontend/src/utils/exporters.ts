import jsPDF from "jspdf";
import pptxgen from "pptxgenjs";
import type { SwarmResults } from "@/types/swarm";

const slideTitles = ["Research", "Fact Check", "Insights", "Summary", "Presentation"];

function clean(value: string) {
  return value.replace(/[#*_`>-]/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function exportResultsPdf(results: SwarmResults) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth() - 80;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("SwarmX AI Research Brief", 40, y);
  y += 34;
  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.text(`Topic: ${results.topic}`, 40, y);
  y += 28;

  const sections = [
    ["Research", results.research],
    ["Fact Check", results.factcheck],
    ["Insights", results.insights],
    ["Summary", results.summary],
    ["Presentation", results.presentation]
  ];

  sections.forEach(([title, body]) => {
    if (y > 700) {
      doc.addPage();
      y = 54;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(title, 40, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(clean(body), width);
    lines.slice(0, 36).forEach((line: string) => {
      if (y > 760) {
        doc.addPage();
        y = 54;
      }
      doc.text(line, 40, y);
      y += 14;
    });
    y += 16;
  });

  doc.save(`SwarmX-${results.topic.slice(0, 32).replace(/\W+/g, "-")}.pdf`);
}

export async function exportResultsPpt(results: SwarmResults) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "SwarmX AI";
  pptx.subject = results.topic;
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos"
  };

  const title = pptx.addSlide();
  title.background = { color: "05070D" };
  title.addText("SwarmX AI", { x: 0.6, y: 0.55, w: 8, h: 0.5, color: "67E8F9", fontSize: 20, bold: true });
  title.addText(results.topic, { x: 0.6, y: 1.35, w: 11, h: 1.4, color: "FFFFFF", fontSize: 36, bold: true });
  title.addText(`Trust score ${results.trustScore}% | Generated ${new Date(results.completedAt ?? results.startedAt).toLocaleString()}`, {
    x: 0.6,
    y: 3.05,
    w: 10,
    h: 0.45,
    color: "CBD5E1",
    fontSize: 14
  });

  const bodies = [results.research, results.factcheck, results.insights, results.summary, results.presentation];
  slideTitles.forEach((sectionTitle, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: "08111F" };
    slide.addText(sectionTitle, { x: 0.55, y: 0.45, w: 8, h: 0.5, color: "FFFFFF", fontSize: 26, bold: true });
    slide.addText(clean(bodies[index]).slice(0, 1100), {
      x: 0.65,
      y: 1.25,
      w: 11.8,
      h: 4.8,
      color: "DDE7F3",
      fontSize: 14,
      fit: "shrink",
      breakLine: false
    });
    slide.addShape(pptx.ShapeType.line, { x: 0.65, y: 6.55, w: 11.7, h: 0, line: { color: "22D3EE", transparency: 35 } });
  });

  await pptx.writeFile({ fileName: `SwarmX-${results.topic.slice(0, 32).replace(/\W+/g, "-")}.pptx` });
}
