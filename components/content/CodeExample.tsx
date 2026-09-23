'use client';

import { useState } from 'react';
import { CodeExample as CodeExampleType } from '@/content/schema';

interface CodeExampleProps {
  example: CodeExampleType;
  leftTitle?: string;
  rightTitle?: string;
}

function CodeBlock({
  title,
  code,
  badge,
}: {
  title: string;
  code: string;
  badge?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-primary)]">
            {title}
          </span>
          {badge && (
            <span className="rounded bg-[var(--border-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
              {badge}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="cursor-pointer rounded border border-[var(--border-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          aria-label="코드 복사"
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[var(--text-primary)]">
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export function CodeExample({
  example,
  leftTitle = 'Before / Left',
  rightTitle = 'After / Right',
}: CodeExampleProps) {
  return (
    <div className="my-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              example.label === '실전 예제'
                ? 'border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            }`}
          >
            {example.label}
          </span>
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            버전: {example.version}
          </span>
        </div>
        {example.sourceProject && (
          <span className="text-xs text-[var(--text-secondary)]">
            실무 적용 시나리오:{' '}
            <strong className="font-medium text-[var(--text-primary)]">
              {example.sourceProject}
            </strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodeBlock title={leftTitle} code={example.leftCode} />
        <CodeBlock title={rightTitle} code={example.rightCode} />
      </div>
    </div>
  );
}
