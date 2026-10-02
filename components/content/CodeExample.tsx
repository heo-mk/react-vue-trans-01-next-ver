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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // 클립보드 API 권한 거부 또는 비보안 컨텍스트 등의 실패 상태를 UI에 표시
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2500);
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
          className={`cursor-pointer rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
            copyStatus === 'copied'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : copyStatus === 'error'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
          }`}
          aria-label={
            copyStatus === 'copied'
              ? '코드 복사 완료'
              : copyStatus === 'error'
                ? '코드 복사 실패'
                : '코드 복사'
          }
        >
          {copyStatus === 'copied'
            ? '✓ 복사됨'
            : copyStatus === 'error'
              ? '✕ 복사 실패'
              : '복사'}
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
            적용 시나리오:{' '}
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
