import { ComparisonRow } from '@/content/schema';

interface ComparisonTableProps {
  rows: ComparisonRow[];
  leftTitle: string;
  rightTitle: string;
}

export function ComparisonTable({
  rows,
  leftTitle,
  rightTitle,
}: ComparisonTableProps) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] shadow-xs">
      <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6 py-4">
        <h3 className="text-base font-bold tracking-tight">핵심 차이 비교표</h3>
      </div>
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
                <td className="border-r border-[var(--border-subtle)] px-6 py-4 leading-relaxed text-[var(--text-secondary)]">
                  {row.left}
                </td>
                <td className="px-6 py-4 leading-relaxed text-[var(--text-secondary)]">
                  {row.right}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
