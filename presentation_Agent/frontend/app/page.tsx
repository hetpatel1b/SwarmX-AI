"use client";

import { FormEvent, useState } from "react";
import { downloadExport, generatePresentation, type GenerateRequest, type PresentationDocument, type VisualStyle } from "../lib/api";
import { SlidePreview } from "../components/SlidePreview";

const initialForm: GenerateRequest = {
  topic: "AI operating model for a mid-market healthcare company",
  audience: "C-suite executives",
  tone: "strategic and practical",
  slideCount: 8,
  language: "English",
  visualStyle: "modern",
  includeSpeakerNotes: true,
  includeCharts: true,
  sourceMaterial: ""
};

export default function Home() {
  const [form, setForm] = useState<GenerateRequest>(initialForm);
  const [presentation, setPresentation] = useState<PresentationDocument | null>(null);
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function onGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Generating presentation...");
    try {
      const next = await generatePresentation(form);
      setPresentation(next);
      setStatus("Presentation ready.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onDownload(format: "pptx" | "pdf") {
    if (!presentation) return;
    setBusy(true);
    setStatus(`Preparing ${format.toUpperCase()}...`);
    try {
      await downloadExport(presentation, format);
      setStatus(`${format.toUpperCase()} downloaded.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[390px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <form onSubmit={onGenerate} className="flex h-full flex-col rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h1 className="text-2xl font-semibold text-ink">Presentation Agent</h1>
              <p className="mt-1 text-sm text-stone-600">Generate slides, speaker notes, PPTX, and PDF without storage.</p>
            </div>

            <label className="text-sm font-medium text-stone-700" htmlFor="topic">
              Topic
            </label>
            <input
              id="topic"
              className="mt-2 rounded border border-stone-300 px-3 py-2 outline-none focus:border-accent"
              value={form.topic}
              onChange={(event) => setForm({ ...form, topic: event.target.value })}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-stone-700">
                Audience
                <input
                  className="mt-2 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-accent"
                  value={form.audience}
                  onChange={(event) => setForm({ ...form, audience: event.target.value })}
                />
              </label>
              <label className="text-sm font-medium text-stone-700">
                Tone
                <input
                  className="mt-2 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-accent"
                  value={form.tone}
                  onChange={(event) => setForm({ ...form, tone: event.target.value })}
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-stone-700">
                Slides
                <input
                  type="number"
                  min={3}
                  max={30}
                  className="mt-2 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-accent"
                  value={form.slideCount}
                  onChange={(event) => setForm({ ...form, slideCount: Number(event.target.value) })}
                />
              </label>
              <label className="text-sm font-medium text-stone-700">
                Style
                <select
                  className="mt-2 w-full rounded border border-stone-300 px-3 py-2 outline-none focus:border-accent"
                  value={form.visualStyle}
                  onChange={(event) => setForm({ ...form, visualStyle: event.target.value as VisualStyle })}
                >
                  <option value="modern">Modern</option>
                  <option value="minimal">Minimal</option>
                  <option value="executive">Executive</option>
                  <option value="bold">Bold</option>
                  <option value="academic">Academic</option>
                </select>
              </label>
            </div>

            <label className="mt-4 text-sm font-medium text-stone-700" htmlFor="source">
              Source material
            </label>
            <textarea
              id="source"
              rows={8}
              className="mt-2 resize-none rounded border border-stone-300 px-3 py-2 outline-none focus:border-accent"
              value={form.sourceMaterial}
              onChange={(event) => setForm({ ...form, sourceMaterial: event.target.value })}
            />

            <div className="mt-4 flex flex-wrap gap-3 text-sm text-stone-700">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.includeSpeakerNotes}
                  onChange={(event) => setForm({ ...form, includeSpeakerNotes: event.target.checked })}
                />
                Speaker notes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.includeCharts}
                  onChange={(event) => setForm({ ...form, includeCharts: event.target.checked })}
                />
                Charts
              </label>
            </div>

            <div className="mt-auto pt-5">
              <button disabled={busy} className="w-full rounded bg-accent px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? "Working..." : "Generate"}
              </button>
              <p className="mt-3 min-h-5 text-sm text-stone-600">{status}</p>
            </div>
          </form>
        </aside>

        <section>
          {presentation ? (
            <>
              <div className="mb-5 flex flex-col justify-between gap-4 border-b border-stone-300 pb-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-accent">{presentation.theme.name}</p>
                  <h2 className="mt-1 text-3xl font-semibold text-ink">{presentation.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-stone-600">{presentation.summary}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onDownload("pptx")} disabled={busy} className="rounded border border-accent px-4 py-2 text-sm font-semibold text-accent disabled:opacity-60">
                    PPTX
                  </button>
                  <button onClick={() => onDownload("pdf")} disabled={busy} className="rounded border border-coral px-4 py-2 text-sm font-semibold text-coral disabled:opacity-60">
                    PDF
                  </button>
                </div>
              </div>
              <SlidePreview presentation={presentation} />
            </>
          ) : (
            <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center rounded-lg border border-dashed border-stone-300 bg-white/60 p-8 text-center">
              <div>
                <h2 className="text-2xl font-semibold text-ink">Ready for a deck.</h2>
                <p className="mt-2 max-w-md text-sm text-stone-600">Fill in the brief and generate a complete presentation preview before exporting.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
