import Link from 'next/link';
import { allConcepts, axisMetadata } from '@/content/index';
import { DiagramSvg } from '@/components/diagram/DiagramSvg';
import { ProgressDashboard } from '@/components/ProgressDashboard';

export default function Home() {
  const axes = Object.keys(axisMetadata) as (keyof typeof axisMetadata)[];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* 히어로 섹션 */}
        <section className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>✨</span> 실무 중심 프레임워크 상호 전환 가이드
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl">
            하나의 개념, 두 가지 시각
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] [text-wrap:balance]">
            <span className="inline-block">이미 아는 프레임워크에서</span>{' '}
            <span className="inline-block">낯선 프레임워크로 넘어갈 때,</span>{' '}
            <span className="inline-block">같은 개념이 어떻게 대응되는지</span>{' '}
            <span className="inline-block">코드 예제로 나란히 비교합니다.</span>
          </p>

          <ul className="mx-auto mt-5 flex max-w-[640px] flex-col gap-2 text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm text-left">
            <li className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 text-left">
              <span className="font-semibold text-[var(--text-primary)] shrink-0 sm:w-36">
                React ↔ Vue:
              </span>
              <span>
                <span className="inline-block">상태 관리, 서버 상태 같은</span>{' '}
                <span className="inline-block">핵심 개념을 양쪽 코드로 비교</span>
              </span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 text-left">
              <span className="font-semibold text-[var(--text-primary)] shrink-0 sm:w-36">
                Vue 2 → Vue 3:
              </span>
              <span>
                <span className="inline-block">Options API를</span>{' '}
                <span className="inline-block">Composition API로 옮기는 방법</span>
              </span>
            </li>
            <li className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 text-left">
              <span className="font-semibold text-[var(--text-primary)] shrink-0 sm:w-36">
                Nuxt 3 ↔ Next.js:
              </span>
              <span>
                <span className="inline-block">렌더링 방식과</span>{' '}
                <span className="inline-block">서버 기능의 차이</span>
              </span>
            </li>
          </ul>
        </section>

        {/* Phase 5: 학습 진도 & 즐겨찾기 대시보드 */}
        <ProgressDashboard />

        {/* 3대 전환 학습 축 목록 */}
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                3대 전환 학습 축
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                관심 있는 전환 경로를 선택하여 핵심 개념과 실전 예제를
                학습하세요.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {axes.map((axis) => {
              const meta = axisMetadata[axis];
              const concepts = allConcepts.filter((c) => c.axis === axis);

              return (
                <div
                  key={axis}
                  className="flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-xs transition-all hover:border-emerald-500/40 hover:shadow-md"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {meta.badge}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {concepts.length}개 개념
                      </span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                      {meta.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {meta.subtitle}
                    </p>
                    <p className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
                    <span className="mb-2 block text-[11px] font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
                      학습 가능한 개념
                    </span>
                    <ul className="space-y-2">
                      {concepts.map((concept) => (
                        <li key={concept.slug}>
                          <Link
                            href={`/${axis}/${concept.slug}`}
                            className="group flex items-center justify-between rounded-lg p-2 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-primary)]"
                          >
                            <span className="line-clamp-1 transition-colors group-hover:text-emerald-500">
                              {concept.title}
                            </span>
                            <span className="text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Phase 3: Mermaid 빌드 파이프라인 실시간 렌더링 섹션 */}
        <section className="mt-16 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8">
          <div className="mb-6 flex flex-col gap-1">
            <div className="inline-flex items-center self-start rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-400">
              구조 한눈에 보기
            </div>
            <h3 className="mt-2 text-2xl font-bold">
              세 가지 전환, 한 장으로 보기
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              세 전환 축의 핵심 차이를 그림으로 요약했습니다. 자세한 설명은 각 개념 카드에서 볼 수 있습니다.
            </p>
          </div>

          <div className="space-y-8">
            <DiagramSvg
              diagramId="reactivity-diagram"
              title="축 1: Vue 감시(Proxy) vs React 알림(setter) 흐름도"
            />
            <DiagramSvg
              diagramId="composition-migration-diagram"
              title="축 2: Options API 파편화 → Composition API 응집 마이그레이션"
            />
            <DiagramSvg
              diagramId="rendering-modes-diagram"
              title="축 3: Nuxt 3 (Universal/Nitro) vs Next.js (App Router/RSC)"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
