import { ComparisonRow } from '@/content/schema';

interface ComparisonTableProps {
  rows: ComparisonRow[];
  leftTitle: string;
  rightTitle: string;
  note?: string;
}

export function ComparisonTable({
  rows,
  leftTitle,
  rightTitle,
  note,
}: ComparisonTableProps) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-xs">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <h3 className="text-base font-bold tracking-tight">핵심 차이 비교표</h3>
      </div>
      {note && (
        <div className="border-b border-[var(--border-subtle)] bg-blue-500/5 px-6 py-4 text-sm leading-relaxed text-[var(--text-secondary)] dark:bg-blue-500/10">
          <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
            <span>📌</span> 참고 사항
          </div>
          <p className="leading-relaxed">{note}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              <th className="w-1/4 border-r border-[var(--border-subtle)] px-6 py-3.5">
                비교 항목
              </th>
              <th className="w-[37.5%] border-r border-[var(--border-subtle)] px-6 py-3.5">
                <span className="inline-flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--diagram-react-border)]" />
                  {leftTitle}
                </span>
              </th>
              <th className="w-[37.5%] px-6 py-3.5">
                <span className="inline-flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--diagram-vue-border)]" />
                  {rightTitle}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {rows.map((row, index) => (
              <tr
                key={index}
                className="transition-colors hover:bg-[var(--bg-secondary)]/40"
              >
                <td className="border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]/20 px-6 py-4 font-semibold text-[var(--text-primary)]">
                  {row.label}
                </td>
                {row.common ? (
                  <td
                    colSpan={2}
                    className="px-6 py-4 leading-relaxed text-[var(--text-secondary)]"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex shrink-0 items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {leftTitle} · {rightTitle} 공통
                      </span>
                      <span>{row.common}</span>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="border-r border-[var(--border-subtle)] px-6 py-4 leading-relaxed text-[var(--text-secondary)]">
                      {row.left}
                    </td>
                    <td className="px-6 py-4 leading-relaxed text-[var(--text-secondary)]">
                      {row.right}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
