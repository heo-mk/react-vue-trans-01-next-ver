import type { ComparisonRow, ComparisonCellContent } from '@repo/content/schema';

interface ComparisonTableProps {
  rows: ComparisonRow[];
  leftTitle: string;
  rightTitle: string;
  note?: string;
}

function renderInlineCode(text: string) {
  if (!text.includes('`')) return text;
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const codeText = part.slice(1, -1);
      return (
        <code
          key={i}
          className="rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-1 py-0.5 font-mono text-[0.85em] font-medium text-[var(--text-primary)] [overflow-wrap:anywhere]"
        >
          {codeText}
        </code>
      );
    }
    return part;
  });
}

function CellContentRenderer({ content }: { content: ComparisonCellContent }) {
  if (typeof content === 'string') {
    return <span>{renderInlineCode(content)}</span>;
  }

  const { lead, items } = content;

  return (
    <div className="space-y-1.5">
      {lead && (
        <div className="font-bold text-[var(--text-primary)]">
          {renderInlineCode(lead)}
        </div>
      )}
      {items && items.length > 0 && (
        <ol className="comparison-list space-y-1.5">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="comparison-item text-sm leading-relaxed text-[var(--text-secondary)]"
            >
              <span className="comparison-item-content">
                {renderInlineCode(item)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
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
      {/* 모바일 카드형 뷰 (640px 이하) */}
      <div className="space-y-3.5 p-4 sm:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 p-4"
          >
            {/* 비교 항목 제목 */}
            <div className="mb-3 border-b border-[var(--border-subtle)] pb-2 text-sm font-bold text-[var(--text-primary)]">
              {row.label}
            </div>

            {row.common ? (
              <div className="space-y-1.5">
                <span className="inline-flex shrink-0 items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {leftTitle} · {rightTitle} 공통
                </span>
                <div className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  <CellContentRenderer content={row.common} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {row.left && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--diagram-react-border)]" />
                      <span>{leftTitle}</span>
                    </div>
                    <div className="pl-3.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      <CellContentRenderer content={row.left} />
                    </div>
                  </div>
                )}
                {row.right && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--diagram-vue-border)]" />
                      <span>{rightTitle}</span>
                    </div>
                    <div className="pl-3.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                      <CellContentRenderer content={row.right} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 데스크톱 테이블 뷰 (641px 이상) */}
      <div className="card-scroll-area hidden overflow-x-auto pb-1.5 sm:block">
        <table className="comparison-table w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              <th className="w-1/4 min-w-[9em] border-r border-[var(--border-subtle)] px-6 py-3.5">
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
                <td className="min-w-[9em] border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]/20 px-6 py-4 font-semibold text-[var(--text-primary)]">
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
                      <div className="flex-1">
                        <CellContentRenderer content={row.common} />
                      </div>
                    </div>
                  </td>
                ) : (
                  <>
                    <td className="border-r border-[var(--border-subtle)] px-6 py-4 leading-relaxed text-[var(--text-secondary)]">
                      {row.left && <CellContentRenderer content={row.left} />}
                    </td>
                    <td className="px-6 py-4 leading-relaxed text-[var(--text-secondary)]">
                      {row.right && <CellContentRenderer content={row.right} />}
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
