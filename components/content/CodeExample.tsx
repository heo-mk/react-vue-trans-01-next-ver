'use client';

import { useState, useEffect } from 'react';
import { CodeExample as CodeExampleType, CodeHighlight } from '@/content/schema';

interface CodeExampleProps {
  example: CodeExampleType;
  leftTitle?: string;
  rightTitle?: string;
}

interface CodeBlockProps {
  title: string;
  code: string;
  side: 'left' | 'right';
  badge?: string;
  highlights?: CodeHighlight[];
  hasAnyHighlight?: boolean;
  onlyKeyLines?: boolean;
  activeId?: number | null;
}

function renderLineTokens(line: string) {
  if (!line) return '\u00A0';
  const parts = line.split(/(\s+)/);
  return parts.map((part, idx) => {
    if (!part) return null;
    if (/^\s+$/.test(part)) {
      return part;
    }
    return (
      <span
        key={idx}
        className="inline-block max-w-full"
        style={{ overflowWrap: 'anywhere', textIndent: 0 }}
      >
        {part}
      </span>
    );
  });
}

function CodeBlock({
  title,
  code,
  side,
  badge,
  highlights,
  hasAnyHighlight = false,
  onlyKeyLines = false,
  activeId = null,
}: CodeBlockProps) {
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

  const lines = code.split('\n');
  const sideHighlights = highlights?.filter((h) => h.side === side) || [];

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

      <div className="flex flex-1 flex-col py-3">
        <div className="card-scroll-area overflow-x-auto font-mono text-xs leading-relaxed text-[var(--text-primary)]">
          <pre className="m-0 p-0 font-mono">
            <code className="block w-full">
              {lines.map((line, lineIdx) => {
                const matchedHl = sideHighlights.find((h) => line.includes(h.match));
                const isHighlighted = !!matchedHl;
                const isActive = matchedHl && activeId === matchedHl.id;

                const leadingMatch = line.match(/^(\s*)/);
                const indent = leadingMatch ? leadingMatch[1].length : 0;

                return (
                  <div
                    key={lineIdx}
                    className={`flex w-full items-start border-l-[3px] px-2 py-0.5 transition-colors sm:px-3 ${
                      isHighlighted
                        ? side === 'left'
                          ? isActive
                            ? 'border-l-[var(--diagram-react-border)] bg-blue-500/25 ring-1 ring-blue-500/40 dark:bg-sky-500/30'
                            : 'border-l-[var(--diagram-react-border)] bg-[var(--diagram-react-bg)]'
                          : isActive
                            ? 'border-l-[var(--diagram-vue-border)] bg-emerald-500/25 ring-1 ring-emerald-500/40 dark:bg-emerald-500/30'
                            : 'border-l-[var(--diagram-vue-border)] bg-[var(--diagram-vue-bg)]'
                        : 'border-l-transparent'
                    } ${
                      onlyKeyLines && !isHighlighted
                        ? 'opacity-40 transition-opacity'
                        : 'opacity-100 transition-opacity'
                    }`}
                  >
                    {hasAnyHighlight && (
                      <span className="mr-1 inline-flex w-[18px] shrink-0 select-none items-center justify-center pt-0.5 sm:mr-1.5 sm:w-5">
                        {isHighlighted && (
                          <span
                            aria-label={`핵심 차이 ${matchedHl.id}`}
                            className={`inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] font-bold text-white shadow-xs transition-transform sm:h-4 sm:w-4 ${
                              side === 'left'
                                ? 'bg-blue-600 dark:bg-blue-500'
                                : 'bg-emerald-600 dark:bg-emerald-500'
                            } ${
                              isActive
                                ? 'scale-110 ring-2 ring-white/70 dark:ring-black/70'
                                : ''
                            }`}
                          >
                            {matchedHl.id}
                          </span>
                        )}
                      </span>
                    )}
                    <span
                      className="block flex-1 min-w-0 font-mono text-xs leading-relaxed text-[var(--text-primary)]"
                      style={{
                        whiteSpace: 'pre-wrap',
                        paddingLeft: indent > 0 ? `${indent}ch` : undefined,
                        textIndent: indent > 0 ? `-${indent}ch` : undefined,
                      }}
                    >
                      {renderLineTokens(line)}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function CodeExample({
  example,
  leftTitle = 'Before / Left',
  rightTitle = 'After / Right',
}: CodeExampleProps) {
  const [onlyKeyLines, setOnlyKeyLines] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);

  const hasHighlights = (example.highlights?.length ?? 0) > 0;
  const hasKeyPoints = (example.keyPoints?.length ?? 0) > 0;

  // Esc 키를 누르면 선택 해제
  useEffect(() => {
    if (activeId === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeId]);

  const activeKeyPoint = example.keyPoints?.find((kp) => kp.id === activeId);

  return (
    <div className="my-8">
      {/* 1. 예제 탭과 버전 + 핵심만 보기 토글 */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span
            className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${
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

        <div className="flex flex-wrap items-center gap-3">
          {example.sourceProject && (
            <span className="text-xs text-[var(--text-secondary)]">
              적용 시나리오:{' '}
              <strong className="font-medium text-[var(--text-primary)]">
                {example.sourceProject}
              </strong>
            </span>
          )}

          {hasHighlights && (
            <button
              type="button"
              aria-pressed={onlyKeyLines}
              onClick={() => setOnlyKeyLines((prev) => !prev)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                onlyKeyLines
                  ? 'border-blue-500/50 bg-blue-500/15 font-semibold text-blue-700 shadow-xs ring-1 ring-blue-500/30 dark:text-blue-300'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  onlyKeyLines
                    ? 'bg-blue-600 dark:bg-blue-400'
                    : 'bg-[var(--border-subtle)]'
                }`}
              />
              <span>핵심만 보기</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. 핵심 차이 요약 박스 (keyPoints가 있을 때만 렌더링) */}
      {hasKeyPoints && example.keyPoints && (
        <div className="mb-4 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2.5 sm:flex-nowrap sm:gap-0">
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold whitespace-nowrap text-[var(--text-primary)]">
                <span>💡</span> 핵심 차이 요약
              </span>
              <span className="shrink-0 rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-blue-600 dark:text-blue-400">
                {example.keyPoints.length}개 포인트
              </span>
            </div>
            <div
              className="mt-0.5 basis-full text-[11px] text-[var(--text-secondary)] sm:mt-0 sm:basis-auto sm:text-right"
              style={{ wordBreak: 'keep-all' }}
            >
              항목을 누르면 해당 코드 줄이 고정으로 강조됩니다. 다시 누르면 해제됩니다.
            </div>
          </div>

          <div className="divide-y divide-[var(--border-subtle)]">
            {example.keyPoints.map((kp) => {
              const isActive = activeId === kp.id;
              return (
                <button
                  key={kp.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveId((prev) => (prev === kp.id ? null : kp.id))}
                  className={`w-full cursor-pointer p-3.5 text-left transition-all border-l-[3px] focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-hidden ${
                    isActive
                      ? 'border-l-blue-600 bg-blue-500/10 dark:border-l-blue-400 dark:bg-blue-500/15'
                      : 'border-l-transparent hover:bg-[var(--bg-primary)]/70'
                  }`}
                >
                  {/* 번호 배지 + title */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      aria-label={`핵심 차이 ${kp.id}`}
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-xs transition-transform ${
                        isActive
                          ? 'bg-blue-600 scale-105 dark:bg-blue-500'
                          : 'bg-blue-600/80 dark:bg-blue-500/80'
                      }`}
                    >
                      {kp.id}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {kp.title}
                    </span>
                  </div>

                  {/* 좌우 설명: 데스크톱 2열, 모바일 위아래 */}
                  <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
                    <div className="flex items-start gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2.5">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--diagram-react-border)]" />
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                          {leftTitle}
                        </div>
                        <div className="leading-relaxed text-[var(--text-primary)]">
                          {kp.left}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2.5">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--diagram-vue-border)]" />
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                          {rightTitle}
                        </div>
                        <div className="leading-relaxed text-[var(--text-primary)]">
                          {kp.right}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 선택 중 표시 바 (activeId가 있을 때 고정 노출) */}
      {activeKeyPoint && (
        <div
          className="sticky z-20 mb-3 flex items-center justify-between gap-2 rounded-lg border border-blue-500/30 bg-[var(--bg-primary)]/95 px-3 py-1.5 shadow-xs backdrop-blur-xs transition-all"
          style={{
            top: 'calc(var(--header-height, 64px) + var(--sticky-header-compact-height, 72px) + 8px)',
          }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
              {activeKeyPoint.id}
            </span>
            <span className="shrink-0 text-xs font-semibold text-[var(--text-secondary)]">
              선택 중:
            </span>
            <span className="truncate text-xs font-bold text-[var(--text-primary)]">
              {activeKeyPoint.title}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveId(null)}
            className="shrink-0 cursor-pointer rounded px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-500/10 dark:text-blue-400"
            aria-label="선택 해제"
          >
            해제 ✕
          </button>
        </div>
      )}

      {/* 4. 좌우 코드 패널 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CodeBlock
          title={leftTitle}
          code={example.leftCode}
          side="left"
          highlights={example.highlights}
          hasAnyHighlight={hasHighlights}
          onlyKeyLines={onlyKeyLines}
          activeId={activeId}
        />
        <CodeBlock
          title={rightTitle}
          code={example.rightCode}
          side="right"
          highlights={example.highlights}
          hasAnyHighlight={hasHighlights}
          onlyKeyLines={onlyKeyLines}
          activeId={activeId}
        />
      </div>
    </div>
  );
}
