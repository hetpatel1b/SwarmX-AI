import type { PresentationDocument } from "../lib/api";

export function SlidePreview({ presentation }: { presentation: PresentationDocument }) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {presentation.slides.map((slide, index) => (
        <article key={slide.id} className="min-h-72 rounded-lg border border-stone-300 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">{String(index + 1).padStart(2, "0")}</span>
            <span className="rounded border border-stone-200 px-2 py-1 text-xs text-stone-500">{slide.layout}</span>
          </div>
          <h3 className="text-xl font-semibold text-ink">{slide.title}</h3>
          {slide.subtitle ? <p className="mt-2 text-sm text-stone-600">{slide.subtitle}</p> : null}
          {slide.quote ? <p className="mt-8 border-l-4 border-accent pl-4 text-lg italic text-stone-700">{slide.quote}</p> : null}
          {slide.bullets?.length ? (
            <ul className="mt-5 space-y-2 text-sm text-stone-700">
              {slide.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {slide.leftBullets || slide.rightBullets ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-accent">{slide.leftTitle}</p>
                <ul className="mt-2 space-y-2 text-sm text-stone-700">
                  {slide.leftBullets?.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold text-coral">{slide.rightTitle}</p>
                <ul className="mt-2 space-y-2 text-sm text-stone-700">
                  {slide.rightBullets?.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              </div>
            </div>
          ) : null}
          {slide.chart ? <p className="mt-5 text-sm font-medium text-stone-700">{slide.chart.title}</p> : null}
        </article>
      ))}
    </section>
  );
}
