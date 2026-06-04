import jsPDF from "jspdf";
import pptxgen from "pptxgenjs";
import type { SwarmResults } from "@/types/swarm";
import { parsePresentationJson, PresentationData } from "./slideParser";

export type ThemeType = "Dark Theme" | "Corporate Theme" | "Startup Theme";

const THEMES = {
  "Dark Theme": {
    bg: "08111F",
    titleBg: "05070D",
    textPrimary: "FFFFFF",
    textSecondary: "CBD5E1",
    accentPrimary: "22D3EE", // Cyan
    accentSecondary: "F43F5E" // Rose
  },
  "Corporate Theme": {
    bg: "FFFFFF",
    titleBg: "F8FAFC",
    textPrimary: "0F172A",
    textSecondary: "475569",
    accentPrimary: "2563EB", // Blue
    accentSecondary: "1D4ED8" // Darker Blue
  },
  "Startup Theme": {
    bg: "FAFAFA",
    titleBg: "18181B",
    textPrimary: "27272A",
    textSecondary: "52525B",
    accentPrimary: "8B5CF6", // Violet
    accentSecondary: "10B981" // Emerald
  }
};

function clean(value: string) {
  if (!value) return "";
  return value.replace(/[#*_`>-]/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

export function exportResultsPdf(results: SwarmResults, themeName: ThemeType = "Dark Theme") {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: [1920, 1080] });
  const theme = THEMES[themeName];
  
  // Parse presentation
  const rawData = (results.rawBackendData as any);
  const payload = rawData?.pipeline?.presentation || rawData?.presentation || results.presentation;
  const presentationData = parsePresentationJson(payload);
  const slides = presentationData.slides;

  // Rebuilt PDF Export: Professional Report Format
  const getAgentData = (agentPayload: any) => agentPayload?.data || agentPayload?.fallbackData || agentPayload || {};
  const pipeline = rawData?.pipeline || {};
  const researchData = getAgentData(pipeline.research);
  const factCheckData = getAgentData(pipeline.factcheck ?? pipeline.factCheck);
  const insightsData = getAgentData(pipeline.insight ?? pipeline.insights);
  const summaryData = getAgentData(pipeline.summary);
  
  const drawBackground = (colorHex: string) => {
    const r = parseInt(colorHex.substring(0, 2), 16);
    const g = parseInt(colorHex.substring(2, 4), 16);
    const b = parseInt(colorHex.substring(4, 6), 16);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, 1920, 1080, "F");
  };

  const setTextColor = (colorHex: string) => {
    const r = parseInt(colorHex.substring(0, 2), 16);
    const g = parseInt(colorHex.substring(2, 4), 16);
    const b = parseInt(colorHex.substring(4, 6), 16);
    doc.setTextColor(r, g, b);
  };

  const addHeader = (title: string, subtitle?: string) => {
    drawBackground(theme.bg);
    setTextColor(theme.textPrimary);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(48);
    doc.text(title, 120, 120);

    const rA = parseInt(theme.accentPrimary.substring(0, 2), 16);
    const gA = parseInt(theme.accentPrimary.substring(2, 4), 16);
    const bA = parseInt(theme.accentPrimary.substring(4, 6), 16);
    doc.setDrawColor(rA, gA, bA);
    doc.setLineWidth(4);
    doc.line(120, 140, 400, 140);
    
    if (subtitle) {
      setTextColor(theme.textSecondary);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(24);
      doc.text(subtitle, 120, 180);
    }
  };

  // 1. Title Page
  drawBackground(theme.titleBg);
  doc.setFont("helvetica", "bold");
  setTextColor(theme.accentPrimary);
  doc.setFontSize(36);
  doc.text("SwarmX AI Complete Intelligence Report", 160, 400);
  
  setTextColor(theme.textPrimary);
  doc.setFontSize(64);
  const topicLines = doc.splitTextToSize(results.topic || "Research Topic", 1600);
  doc.text(topicLines, 160, 500);

  setTextColor(theme.textSecondary);
  doc.setFontSize(24);
  doc.setFont("helvetica", "normal");
  doc.text(`Overall Trust Score: ${results.trustScore}% | Date: ${new Date(results.completedAt ?? results.startedAt ?? Date.now()).toLocaleString()}`, 160, 800);

  // 2. Executive Summary & Insights
  if (summaryData?.summary || insightsData?.keyInsights?.length) {
    doc.addPage();
    addHeader("Executive Summary & Key Insights");
    
    setTextColor(theme.textSecondary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(28);
    
    let yPos = 240;
    if (summaryData?.summary) {
      const summaryText = typeof summaryData.summary === 'string' ? summaryData.summary : String(summaryData.summary);
      const lines = doc.splitTextToSize(clean(summaryText), 1680);
      doc.text(lines, 120, yPos);
      yPos += lines.length * 40 + 40;
    }
    
    if (insightsData?.keyInsights?.length) {
      setTextColor(theme.textPrimary);
      doc.setFont("helvetica", "bold");
      doc.text("Key Insights:", 120, yPos);
      yPos += 50;
      
      setTextColor(theme.textSecondary);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(24);
      const insights = Array.isArray(insightsData.keyInsights) ? insightsData.keyInsights : [];
      insights.forEach((insight: string) => {
        if (yPos > 950) {
          doc.addPage();
          addHeader("Executive Summary (Cont.)");
          yPos = 240;
        }
        const bulletLines = doc.splitTextToSize(`• ${clean(String(insight))}`, 1600);
        doc.text(bulletLines, 140, yPos);
        yPos += bulletLines.length * 36 + 16;
      });
    }
  }

  // 3. Research Deep Dive
  if (researchData?.overview || researchData?.sections?.length) {
    doc.addPage();
    addHeader("Research Overview");
    
    setTextColor(theme.textSecondary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(24);
    
    let yPos = 240;
    if (researchData?.overview) {
      const lines = doc.splitTextToSize(clean(String(researchData.overview)), 1680);
      doc.text(lines, 120, yPos);
      yPos += lines.length * 36 + 40;
    }
    
    const sections = Array.isArray(researchData.sections) ? researchData.sections : [];
    sections.forEach((section: any) => {
      if (yPos > 900) {
        doc.addPage();
        addHeader("Research Deep Dive");
        yPos = 240;
      }
      setTextColor(theme.textPrimary);
      doc.setFont("helvetica", "bold");
      doc.text(String(section.heading || "Section"), 120, yPos);
      yPos += 40;
      
      setTextColor(theme.textSecondary);
      doc.setFont("helvetica", "normal");
      const contentLines = doc.splitTextToSize(clean(String(section.content || "")), 1680);
      doc.text(contentLines, 120, yPos);
      yPos += contentLines.length * 36 + 40;
    });
  }

  // 4. Fact Check Verification
  if (factCheckData?.verifiedFacts?.length || factCheckData?.flaggedClaims?.length) {
    doc.addPage();
    addHeader("Fact Check & Verification", `Trust Score: ${factCheckData.trustScoreScaled ?? factCheckData.trustScore ?? 0}%`);
    
    let yPos = 240;
    
    const vFacts = Array.isArray(factCheckData.verifiedFacts) ? factCheckData.verifiedFacts : [];
    if (vFacts.length) {
      setTextColor(theme.accentSecondary); 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("Verified Facts", 120, yPos);
      yPos += 40;
      
      setTextColor(theme.textSecondary);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(24);
      vFacts.forEach((fact: string) => {
        if (yPos > 950) { doc.addPage(); addHeader("Fact Check (Cont.)"); yPos = 240; }
        const lines = doc.splitTextToSize(`✓ ${clean(String(fact))}`, 1600);
        doc.text(lines, 140, yPos);
        yPos += lines.length * 36 + 12;
      });
      yPos += 20;
    }
    
    const fClaims = Array.isArray(factCheckData.flaggedClaims) ? factCheckData.flaggedClaims : [];
    if (fClaims.length) {
      if (yPos > 850) { doc.addPage(); addHeader("Fact Check (Cont.)"); yPos = 240; }
      setTextColor(theme.accentPrimary); 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.text("Flagged Claims", 120, yPos);
      yPos += 40;
      
      setTextColor(theme.textSecondary);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(24);
      fClaims.forEach((claim: string) => {
        if (yPos > 950) { doc.addPage(); addHeader("Fact Check (Cont.)"); yPos = 240; }
        const lines = doc.splitTextToSize(`⚠ ${clean(String(claim))}`, 1600);
        doc.text(lines, 140, yPos);
        yPos += lines.length * 36 + 12;
      });
    }
  }

  // 5. Recommendations (from Analysis)
  if (insightsData?.recommendations?.length) {
    doc.addPage();
    addHeader("Strategic Recommendations");
    
    setTextColor(theme.textSecondary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(28);
    
    let yPos = 240;
    const recs = Array.isArray(insightsData.recommendations) ? insightsData.recommendations : [];
    recs.forEach((rec: string, i: number) => {
      if (yPos > 950) {
        doc.addPage();
        addHeader("Strategic Recommendations (Cont.)");
        yPos = 240;
      }
      setTextColor(theme.textPrimary);
      doc.setFont("helvetica", "bold");
      doc.text(`Recommendation ${i + 1}:`, 120, yPos);
      yPos += 40;
      
      setTextColor(theme.textSecondary);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(clean(String(rec)), 1680);
      doc.text(lines, 120, yPos);
      yPos += lines.length * 36 + 40;
    });
  }

  // 6. References
  if (researchData?.sources?.length) {
    doc.addPage();
    addHeader("References & Sources");
    
    setTextColor(theme.accentSecondary);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(24);
    
    let yPos = 240;
    const sources = Array.isArray(researchData.sources) ? researchData.sources : [];
    sources.forEach((source: string, i: number) => {
      if (yPos > 950) { doc.addPage(); addHeader("References (Cont.)"); yPos = 240; }
      const lines = doc.splitTextToSize(`[${i + 1}] ${clean(String(source))}`, 1680);
      doc.text(lines, 120, yPos);
      yPos += lines.length * 36 + 20;
    });
  }

  // 5. Presentation Preview Slides
  if (slides && slides.length > 0) {
    slides.forEach((slide) => {
      doc.addPage();
      drawBackground(theme.bg);
      
      setTextColor(theme.textPrimary);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(56);
      const titleLines = doc.splitTextToSize(slide.title, 1680);
      doc.text(titleLines, 120, 160);
      
      const rA = parseInt(theme.accentPrimary.substring(0, 2), 16);
      const gA = parseInt(theme.accentPrimary.substring(2, 4), 16);
      const bA = parseInt(theme.accentPrimary.substring(4, 6), 16);
      doc.setDrawColor(rA, gA, bA);
      doc.setLineWidth(6);
      doc.line(120, 180 + (titleLines.length - 1) * 60 + 20, 400, 180 + (titleLines.length - 1) * 60 + 20);

      setTextColor(theme.textSecondary);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(36);
      let yPos = 320 + (titleLines.length - 1) * 60;

      slide.bullets.forEach((bullet) => {
        doc.setFillColor(rA, gA, bA);
        doc.circle(135, yPos - 12, 8, "F");

        const bulletLines = doc.splitTextToSize(bullet, 1600);
        doc.text(bulletLines, 170, yPos);
        yPos += bulletLines.length * 56 + 24;
      });

      doc.setDrawColor(rA, gA, bA);
      doc.setLineWidth(2);
      doc.line(120, 1000, 1800, 1000);
      doc.setFontSize(20);
      doc.text(`Presentation Slide ${slide.slideNumber}`, 1650, 1040);
    });
  }

  doc.save(`SwarmX-Report-${results.topic.slice(0, 32).replace(/\W+/g, "-")}.pdf`);
}

export async function exportResultsPpt(results: SwarmResults, themeName: ThemeType = "Dark Theme") {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 16:9
  pptx.author = "SwarmX AI";
  pptx.subject = results.topic;
  
  // Theme settings
  const theme = THEMES[themeName];
  const isDarkTitle = themeName === "Dark Theme" || themeName === "Startup Theme";
  const titleTextColor = isDarkTitle ? "FFFFFF" : "0F172A";
  
  pptx.theme = {
    headFontFace: "Arial",
    bodyFontFace: "Arial"
  };

  const rawData = (results.rawBackendData as any);
  const payload = rawData?.pipeline?.presentation || rawData?.presentation || results.presentation;
  const presentationData = parsePresentationJson(payload);
  const slides = presentationData.slides;

  // 1. Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: theme.titleBg };
  
  titleSlide.addText(presentationData.title || "SwarmX AI Research Brief", { 
    x: 1.0, y: 2.0, w: 10, h: 0.5, 
    color: theme.accentPrimary, 
    fontSize: 24, 
    bold: true 
  });
  
  titleSlide.addText(results.topic, { 
    x: 1.0, y: 2.8, w: 11.33, h: 1.5, 
    color: titleTextColor, 
    fontSize: 48, 
    bold: true 
  });
  
  titleSlide.addText(`Trust score ${results.trustScore}% | Generated ${new Date(results.completedAt ?? results.startedAt ?? Date.now()).toLocaleString()}`, {
    x: 1.0,
    y: 6.0,
    w: 10,
    h: 0.5,
    color: theme.textSecondary,
    fontSize: 16
  });

  // 2. Executive Summary (if present)
  if (presentationData.executiveSummary) {
    const summarySlide = pptx.addSlide();
    summarySlide.background = { color: theme.bg };
    
    summarySlide.addText("Executive Summary", { 
      x: 0.8, y: 0.8, w: 10, h: 0.8, 
      color: theme.textPrimary, 
      fontSize: 36, 
      bold: true 
    });
    
    summarySlide.addShape(pptx.ShapeType.line, { 
      x: 0.8, y: 1.6, w: 2, h: 0, 
      line: { color: theme.accentPrimary, width: 4 } 
    });

    summarySlide.addText(presentationData.executiveSummary, {
      x: 0.8, y: 2.2, w: 11.7, h: 4.5,
      color: theme.textSecondary,
      fontSize: 22,
      valign: "top",
      breakLine: false
    });
  }

  // 3. Normal Slides
  slides.forEach((slideData) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };
    
    // Header
    slide.addText(slideData.title || `Slide ${slideData.slideNumber}`, { 
      x: 0.8, y: 0.8, w: 11.7, h: 0.8, 
      color: theme.textPrimary, 
      fontSize: 36, 
      bold: true 
    });

    slide.addShape(pptx.ShapeType.line, { 
      x: 0.8, y: 1.6, w: 2, h: 0, 
      line: { color: theme.accentPrimary, width: 4 } 
    });

    // Bullets
    const bulletText = slideData.bullets.map(b => ({
      text: b,
      options: { 
        bullet: true, 
        color: theme.textSecondary, 
        fontSize: 22,
        breakLine: true
      }
    }));
    
    if (bulletText.length > 0) {
      slide.addText(bulletText, {
        x: 0.8, y: 2.2, w: 11.7, h: 4.5,
        valign: "top"
      });
    }

    // Footer Line
    slide.addShape(pptx.ShapeType.line, { 
      x: 0.8, y: 6.8, w: 11.7, h: 0, 
      line: { color: theme.accentPrimary, transparency: 50, width: 1 } 
    });
    
    // Slide Number
    slide.addText(`${slideData.slideNumber}`, { 
      x: 12.0, y: 6.9, w: 0.5, h: 0.4, 
      color: theme.textSecondary, 
      fontSize: 14, 
      align: "right" 
    });

    // Speaker Notes
    if (slideData.speakerNotes) {
      slide.addNotes(slideData.speakerNotes);
    }
  });

  // Export
  await pptx.writeFile({ fileName: `SwarmX-${results.topic.slice(0, 32).replace(/\W+/g, "-")}.pptx` });
}
