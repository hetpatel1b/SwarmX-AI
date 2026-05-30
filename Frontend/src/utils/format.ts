export function formatSeconds(value: number) {
  if (value < 1) return `${Math.round(value * 1000)}ms`;
  return `${value.toFixed(1)}s`;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function scoreFromText(...parts: string[]) {
  const combinedLength = parts.join(" ").length;
  return clamp(72 + Math.round(Math.min(24, combinedLength / 900)));
}
