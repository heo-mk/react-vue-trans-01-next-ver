'use client';

import Link from 'next/link';
import type { ConceptPage } from '@repo/content/schema';
import type { AxisMeta } from '@/lib/graphql/loaders';
import { useUiStore } from '@/store/useUiStore';
import { useIsMounted } from '@/components/useIsMounted';
import { FormattedTitle } from '@/components/FormattedTitle';
import { Tooltip } from '@/components/Tooltip';

interface ConceptHeaderProps {
  concept: ConceptPage;
  meta: AxisMeta;
}

export function ConceptHeader({ concept, meta }: ConceptHeaderProps) {
  const { readConcepts, toggleReadConcept, favorites, toggleFavorite } =
    useUiStore();
  const isMounted = useIsMounted();

  const isRead = isMounted ? readConcepts.includes(concept.slug) : false;
  const isFav = isMounted ? favorites.includes(concept.slug) : false;

  const rawTitle = concept.cardTitle || concept.title;
  // 괄호 포함 제목은 괄호 앞부분만 추출 (모바일 슬림 헤더용)
  const cleanTitle = rawTitle.split(/[(（]/)[0].trim();

  const readLabel = isRead ? '✓ 완료 취소' : '○ 학습 완료로 표시';
  const favLabel = isFav ? '★ 북마크 해제' : '☆ 북마크에 추가';

  return (
    <header
      className="sticky top-[var(--header-height,64px)] z-30 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] isolate [contain:paint] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* ========================================================= */}
        {/* A. 모바일 뷰 (sm:hidden) - 처음부터 상단에 완벽 흡착 고정     */}
        {/* 스크롤 시 높이 변화 0px, 덜컥거림/흔들림 0% 영구 불변         */}
        {/* ========================================================= */}
        <div className="py-2.5 sm:hidden">
          {/* 1줄: 뒤로가기 버튼 + 축 배지 + 터치 타깃 40x40px 액션 버튼 2개 */}
          <div className="flex items-center justify-between gap-2 min-h-[40px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <Link
                href="/"
                aria-label="전체 가이드 홈으로 이동"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-bold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                ←
              </Link>
              <span className="shrink-0 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                {meta.badge} · {meta.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Tooltip content={readLabel} position="bottom">
                <button
                  onClick={() => toggleReadConcept(concept.slug)}
                  type="button"
                  aria-label={readLabel}
                  className={`inline-flex h-10 w-10 min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-lg text-base font-bold transition-colors ${
                    isRead
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span aria-hidden="true">{isRead ? '✓' : '○'}</span>
                </button>
              </Tooltip>

              <Tooltip content={favLabel} position="bottom">
                <button
                  onClick={() => toggleFavorite(concept.slug)}
                  type="button"
                  aria-label={favLabel}
                  className={`inline-flex h-10 w-10 min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-lg text-base font-bold transition-colors ${
                    isFav
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span aria-hidden="true">{isFav ? '★' : '☆'}</span>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* 2줄: 볼드 제목 */}
          <h1 className="mt-1 text-base font-bold leading-snug tracking-tight text-[var(--text-primary)] [word-break:keep-all] line-clamp-2">
            <FormattedTitle text={cleanTitle} />
          </h1>
        </div>

        {/* ========================================================= */}
        {/* B. PC / 태블릿 뷰 (hidden sm:block) - 전체 펼침 상단 영구 고정 */}
        {/* ========================================================= */}
        <div className="hidden sm:block pt-5 pb-6">
          {/* 상단 뒤로가기 링크 + 배지 */}
          <nav className="mb-3 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              ← 전체 가이드 홈으로
            </Link>
            <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              {meta.badge} · {meta.title}
            </span>
          </nav>

          {/* 메인 헤더 바디 (대제목 + 부제 + 풀 버튼) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl lg:text-4xl leading-tight [word-break:keep-all]">
                <FormattedTitle text={rawTitle} />
              </h1>
              {concept.cardSubtitle && (
                <p className="mt-2 text-sm sm:text-base font-medium text-[var(--text-secondary)] [word-break:keep-all]">
                  <FormattedTitle text={concept.cardSubtitle} />
                </p>
              )}
            </div>

            {/* PC 액션 버튼 2개 */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => toggleReadConcept(concept.slug)}
                type="button"
                aria-label={readLabel}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  isRead
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span aria-hidden="true" className="font-bold text-base">
                  {isRead ? '✓' : '○'}
                </span>
                <span>{isRead ? '완료 취소' : '학습 완료로 표시'}</span>
              </button>

              <button
                onClick={() => toggleFavorite(concept.slug)}
                type="button"
                aria-label={favLabel}
                className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  isFav
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span aria-hidden="true" className="font-bold text-base">
                  {isFav ? '★' : '☆'}
                </span>
                <span>{isFav ? '북마크 해제' : '북마크에 추가'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
