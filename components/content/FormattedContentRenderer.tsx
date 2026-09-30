import { FormattedContent } from '@/content/schema';

interface FormattedContentRendererProps {
  content: FormattedContent;
  className?: string;
}

export function FormattedContentRenderer({
  content,
  className = '',
}: FormattedContentRendererProps) {
  if (typeof content === 'string') {
    return (
      <p
        className={`text-sm leading-relaxed text-[var(--text-secondary)] [word-break:keep-all] [overflow-wrap:anywhere] ${className}`}
      >
        {content}
      </p>
    );
  }

  const { lead, listType, items, closing } = content;

  return (
    <div
      className={`space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] [word-break:keep-all] [overflow-wrap:anywhere] ${className}`}
    >
      {lead && (
        <p className="font-medium text-[var(--text-primary)]">
          {lead}
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="space-y-2 pl-1 sm:pl-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-left leading-relaxed"
            >
              <span className="shrink-0 font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {listType === 'ordered' ? `${index + 1})` : '•'}
              </span>
              <div className="flex-1">
                {item.term ? (
                  <>
                    <strong className="font-semibold text-[var(--text-primary)]">
                      {item.term}:
                    </strong>{' '}
                    <span>{item.desc}</span>
                  </>
                ) : (
                  <span>{item.desc}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {closing && (
        <p className="pt-0.5 text-xs sm:text-sm text-[var(--text-secondary)]">
          {closing}
        </p>
      )}
    </div>
  );
}
