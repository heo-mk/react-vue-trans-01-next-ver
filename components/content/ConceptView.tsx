'use client';

import Link from 'next/link';
import { ConceptPage } from '@/content/schema';
import { axisMetadata } from '@/content/index';
import { ComparisonTable } from './ComparisonTable';
import { CodeExample } from './CodeExample';
import { PitfallCallout } from './PitfallCallout';
import { DiagramSvg } from '@/components/diagram/DiagramSvg';
import { useUiStore } from '@/store/useUiStore';
import { useIsMounted } from '@/components/useIsMounted';

interface ConceptViewProps {
  concept: ConceptPage;
}

export function ConceptView({ concept }: ConceptViewProps) {
  const meta = axisMetadata[concept.axis];
  const { readConcepts, toggleReadConcept, favorites, toggleFavorite } =
    useUiStore();
  const isMounted = useIsMounted();

  const isRead = isMounted ? readConcepts.includes(concept.slug) : false;
  const isFav = isMounted ? favorites.includes(concept.slug) : false;

  return (
    <article className="mx-auto max-w-5xl px-6 py-10">
      {/* 상단 브레드크럼 및 뒤로가기 */}
      <nav className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          ← 전체 가이드 홈으로
        </Link>
        <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
          {meta.badge} · {meta.title}
        </span>
      </nav>

      {/* 헤더 & 액션 바 */}
      <header className="border-b border-[var(--border-subtle)] pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
            {concept.title}
          </h1>

          {/* 읽음 및 즐겨찾기 인터랙션 */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => toggleReadConcept(concept.slug)}
              type="button"
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isRead
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {isRead ? '✓ 학습 완료' : '○ 미완료'}
            </button>
            <button
              onClick={() => toggleFavorite(concept.slug)}
              type="button"
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                isFav
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
              }`}
              aria-label="즐겨찾기 토글"
            >
              {isFav ? '★ 즐겨찾기' : '☆ 북마크'}
            </button>
          </div>
        </div>

        {/* 파인만 테크닉 핵심 한줄 요약 */}
        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            <span>💡</span> 파인만 핵심 요약
          </div>
          <p className="mt-2 text-base leading-relaxed font-medium text-[var(--text-primary)]">
            {concept.oneLineSummary}
          </p>
        </div>

        {/* 직관적 비유 */}
        {concept.analogy && (
          <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span>🎭</span> 직관적 비유
              </span>
              {concept.sourceNote && (
                <span className="text-[11px] opacity-75">
                  출처: {concept.sourceNote}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              {concept.analogy}
            </p>
          </div>
        )}
      </header>

      {/* 1. 구조도 (다이어그램) */}
      {concept.diagramId && (
        <section className="my-10">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            구조적 실행 모델 (Mermaid SVG)
          </h2>
          <DiagramSvg diagramId={concept.diagramId} />
        </section>
      )}

      {/* 2. 핵심 비교표 */}
      <section className="my-10">
        <ComparisonTable
          rows={concept.comparisonTable}
          leftTitle={meta.leftFramework}
          rightTitle={meta.rightFramework}
        />
      </section>

      {/* 3. 코드 예제 (기초 및 실전) */}
      <section className="my-12">
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          코드 레벨 직접 비교
        </h2>
        <div className="mt-4 divide-y divide-[var(--border-subtle)]">
          {concept.codeExamples.map((example, index) => (
            <CodeExample
              key={index}
              example={example}
              leftTitle={meta.leftFramework}
              rightTitle={meta.rightFramework}
            />
          ))}
        </div>
      </section>

      {/* 4. 함정 문답 (Pitfalls) */}
      <section className="my-12">
        <PitfallCallout pitfalls={concept.pitfalls} />
      </section>

      {/* 5. 공식 출처 */}
      {concept.sources && concept.sources.length > 0 && (
        <footer className="mt-16 border-t border-[var(--border-subtle)] pt-8">
          <h3 className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
            참고 공식 문서 및 출처
          </h3>
          <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
            {concept.sources.map((src, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <span>🔗</span>
                {src.url ? (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline transition-colors hover:text-[var(--text-primary)]"
                  >
                    {src.label}
                  </a>
                ) : (
                  <span>{src.label}</span>
                )}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </article>
  );
}
