'use client';

import { ConceptPage } from '@/content/schema';
import { axisMetadata } from '@/content/index';
import { ComparisonTable } from './ComparisonTable';
import { CodeExample } from './CodeExample';
import { PitfallCallout } from './PitfallCallout';
import { FormattedContentRenderer } from './FormattedContentRenderer';
import { DiagramSvg } from '@/components/diagram/DiagramSvg';
import { ConceptHeader } from './ConceptHeader';

interface ConceptViewProps {
  concept: ConceptPage;
}

export function ConceptView({ concept }: ConceptViewProps) {
  const meta = axisMetadata[concept.axis];

  return (
    <div className="relative min-h-full">
      {/* 화면 전체 폭 불투명 배경을 가진 반응형 Sticky 제목 영역 */}
      <ConceptHeader concept={concept} />

      {/* 본문 콘텐츠 영역 */}
      <article className="mx-auto max-w-5xl px-6 py-8">
        {/* 파인만 테크닉 핵심 한줄 요약 */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 dark:bg-emerald-950/20">
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
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
              <span>🎭</span>
              <span>직관적 비유</span>
            </div>
            <div className="mt-2">
              <FormattedContentRenderer content={concept.analogy} />
            </div>
          </div>
        )}

      {/* 1. 구조도 (다이어그램) */}
      {concept.diagramId && (
        <section className="my-10">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
            구조적 실행 모델
          </h2>
          <DiagramSvg diagramId={concept.diagramId} />
        </section>
      )}

      {/* 2. 핵심 비교표 */}
      <section className="my-10">
        <ComparisonTable
          note={concept.comparisonNote}
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
      {concept.sources &&
        concept.sources.filter((src) => src.url && src.url.startsWith('http'))
          .length > 0 && (
          <footer className="mt-16 border-t border-[var(--border-subtle)] pt-8">
            <h3 className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
              참고 공식 문서 및 출처
            </h3>
            <ul className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
              {concept.sources
                .filter((src) => src.url && src.url.startsWith('http'))
                .map((src, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span>🔗</span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline transition-colors hover:text-[var(--text-primary)]"
                    >
                      {src.label}
                    </a>
                  </li>
                ))}
            </ul>
          </footer>
        )}
      </article>
    </div>
  );
}
