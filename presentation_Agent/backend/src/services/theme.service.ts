import type { Theme, VisualStyle } from "../types/presentation.js";

const themes: Record<VisualStyle, Theme> = {
  modern: {
    name: "Modern Teal",
    background: "F7F3EC",
    surface: "FFFFFF",
    primary: "0F766E",
    secondary: "334155",
    accent: "E4572E",
    text: "141414",
    muted: "64748B",
    fontFace: "Aptos"
  },
  minimal: {
    name: "Minimal Ink",
    background: "FAFAFA",
    surface: "FFFFFF",
    primary: "111827",
    secondary: "6B7280",
    accent: "2563EB",
    text: "111827",
    muted: "6B7280",
    fontFace: "Aptos"
  },
  executive: {
    name: "Executive Clear",
    background: "F8FAFC",
    surface: "FFFFFF",
    primary: "174E4F",
    secondary: "1F2937",
    accent: "B45309",
    text: "111827",
    muted: "64748B",
    fontFace: "Aptos Display"
  },
  bold: {
    name: "Bold Studio",
    background: "FFF7ED",
    surface: "FFFFFF",
    primary: "BE123C",
    secondary: "1E293B",
    accent: "0D9488",
    text: "18181B",
    muted: "71717A",
    fontFace: "Aptos"
  },
  academic: {
    name: "Academic Field",
    background: "F6F8F3",
    surface: "FFFFFF",
    primary: "365314",
    secondary: "374151",
    accent: "1D4ED8",
    text: "1F2937",
    muted: "6B7280",
    fontFace: "Aptos"
  }
};

export function getTheme(style: VisualStyle): Theme {
  return themes[style] ?? themes.modern;
}
