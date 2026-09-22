import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ⇄
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                React ↔ Vue 전환 학습 가이드
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                현대 프론트엔드 프레임워크 상호 전환 지식 허브
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* 메인 히어로 */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="mb-16 text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Phase 1: 디자인 토큰 & 다크모드 체계 구축 완료
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            하나의 개념, 두 가지 시각
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[var(--text-secondary)]">
            React 개발자를 위한 Vue, Vue2 레거시를 위한 Vue3, 그리고 Nuxt와
            Next를 관통하는 핵심 아키텍처 비교 학습
          </p>
        </section>

        {/* 3대 학습 축 프리뷰 */}
        <section className="mb-16">
          <h3 className="mb-6 text-xl font-bold tracking-tight">
            3대 전환 학습 축
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-xs">
              <div className="mb-3 inline-block rounded-md bg-[var(--diagram-react-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--diagram-react-text)]">
                축 1
              </div>
              <h4 className="text-lg font-semibold">React ↔ Vue</h4>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                JSX와 템플릿, Hooks와 Composition API의 반응성 모델 멘탈 모델
                매핑
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-xs">
              <div className="mb-3 inline-block rounded-md bg-[var(--diagram-vue-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--diagram-vue-text)]">
                축 2
              </div>
              <h4 className="text-lg font-semibold">Vue2 → Vue3</h4>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Options API에서 {'<script setup>'} 및 Composition API로의 안전한
                마이그레이션
              </p>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-xs">
              <div className="mb-3 inline-block rounded-md bg-[var(--diagram-ok-bg)] px-2.5 py-1 text-xs font-semibold text-[var(--diagram-ok-text)]">
                축 3
              </div>
              <h4 className="text-lg font-semibold">Nuxt3 ↔ Next.js</h4>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                서버 컴포넌트(RSC)와 Nitro 서버 엔진의 SSR / SSG 하이브리드
                아키텍처 비교
              </p>
            </div>
          </div>
        </section>

        {/* 다이어그램 토큰 색상 검증 섹션 */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-xl font-bold">다이어그램 디자인 토큰 검증</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                우측 상단 테마 버튼을 토글하여 라이트/다크 모드별 SVG 다이어그램
                토큰 색상 전환을 실시간으로 확인하세요.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* Vue Token */}
            <div
              className="flex flex-col items-center justify-center rounded-xl p-5 text-center transition-colors"
              style={{
                backgroundColor: 'var(--diagram-vue-bg)',
                border: '1.5px solid var(--diagram-vue-border)',
                color: 'var(--diagram-vue-text)',
              }}
            >
              <span className="font-mono text-xs font-bold tracking-wider uppercase">
                Vue Token
              </span>
              <span className="mt-1 text-base font-semibold">
                --diagram-vue-*
              </span>
              <span className="mt-2 text-xs opacity-80">
                반응성 / Composition
              </span>
            </div>

            {/* React Token */}
            <div
              className="flex flex-col items-center justify-center rounded-xl p-5 text-center transition-colors"
              style={{
                backgroundColor: 'var(--diagram-react-bg)',
                border: '1.5px solid var(--diagram-react-border)',
                color: 'var(--diagram-react-text)',
              }}
            >
              <span className="font-mono text-xs font-bold tracking-wider uppercase">
                React Token
              </span>
              <span className="mt-1 text-base font-semibold">
                --diagram-react-*
              </span>
              <span className="mt-2 text-xs opacity-80">Hooks / 불변성</span>
            </div>

            {/* Warn Token */}
            <div
              className="flex flex-col items-center justify-center rounded-xl p-5 text-center transition-colors"
              style={{
                backgroundColor: 'var(--diagram-warn-bg)',
                border: '1.5px solid var(--diagram-warn-border)',
                color: 'var(--diagram-warn-text)',
              }}
            >
              <span className="font-mono text-xs font-bold tracking-wider uppercase">
                Warn Token
              </span>
              <span className="mt-1 text-base font-semibold">
                --diagram-warn-*
              </span>
              <span className="mt-2 text-xs opacity-80">
                함정 질문 / 주의사항
              </span>
            </div>

            {/* Ok Token */}
            <div
              className="flex flex-col items-center justify-center rounded-xl p-5 text-center transition-colors"
              style={{
                backgroundColor: 'var(--diagram-ok-bg)',
                border: '1.5px solid var(--diagram-ok-border)',
                color: 'var(--diagram-ok-text)',
              }}
            >
              <span className="font-mono text-xs font-bold tracking-wider uppercase">
                Ok Token
              </span>
              <span className="mt-1 text-base font-semibold">
                --diagram-ok-*
              </span>
              <span className="mt-2 text-xs opacity-80">
                해결책 / 모범 사례
              </span>
            </div>
          </div>

          {/* 중립(Neutral) 토큰 */}
          <div className="mt-6">
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-[var(--text-secondary)] uppercase">
              중립 단계 토큰 (--diagram-neutral-1 ~ 4)
            </h4>
            <div className="grid grid-cols-4 gap-3 text-center text-xs">
              <div
                className="rounded-lg p-3 font-mono font-medium"
                style={{
                  backgroundColor: 'var(--diagram-neutral-1)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--diagram-text)',
                }}
              >
                Neutral 1
              </div>
              <div
                className="rounded-lg p-3 font-mono font-medium"
                style={{
                  backgroundColor: 'var(--diagram-neutral-2)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--diagram-text)',
                }}
              >
                Neutral 2
              </div>
              <div
                className="rounded-lg p-3 font-mono font-medium"
                style={{
                  backgroundColor: 'var(--diagram-neutral-3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--diagram-text)',
                }}
              >
                Neutral 3
              </div>
              <div
                className="rounded-lg p-3 font-mono font-medium"
                style={{
                  backgroundColor: 'var(--diagram-neutral-4)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--diagram-text)',
                }}
              >
                Neutral 4
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
