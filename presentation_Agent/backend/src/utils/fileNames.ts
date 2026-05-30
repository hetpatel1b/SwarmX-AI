export function safeFileName(value: string, extension: "pptx" | "pdf") {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return `${slug || "presentation"}.${extension}`;
}
