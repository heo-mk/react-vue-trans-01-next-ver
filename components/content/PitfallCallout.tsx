import { Pitfall } from '@/content/schema';

interface PitfallCalloutProps {
  pitfalls: Pitfall[];
}

export function PitfallCallout({ pitfalls }: PitfallCalloutProps) {
  if (!pitfalls || pitfalls.length === 0) return null;

  return (
    <div className="my-10 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--diagram-warn-bg)] border border-[var(--diagram-warn-border)] text-xs font-bold text-[var(--diagram-warn-text)]">
          ⚠️
        </span>
        <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          학습 & 실전 면접 함정 Q&A
        </h3>
      </div>

      <div className="space-y-4">
        {pitfalls.map((pitfall, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-[var(--diagram-warn-border)]/40 bg-[var(--diagram-warn-bg)]/25 p-5 shadow-xs transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 rounded-md bg-[var(--diagram-warn-bg)] border border-[var(--diagram-warn-border)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--diagram-warn-text)]">
                Q
              </span>
              <h4 className="text-sm font-bold leading-snug text-[var(--text-primary)]">
                {pitfall.question}
              </h4>
            </div>
            <div className="mt-3.5 flex items-start gap-3 border-t border-[var(--diagram-warn-border)]/20 pt-3.5">
              <span className="shrink-0 rounded-md bg-[var(--diagram-ok-bg)] border border-[var(--diagram-ok-border)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--diagram-ok-text)]">
                A
              </span>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {pitfall.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
