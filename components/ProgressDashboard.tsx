'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUiStore } from '@/store/useUiStore';
import { useIsMounted } from '@/components/useIsMounted';
import { allConcepts } from '@/content/index';

type FilterType = 'all' | 'completed' | 'favorites';

export function ProgressDashboard() {
  const { readConcepts, favorites } = useUiStore();
  const isMounted = useIsMounted();
  const [filter, setFilter] = useState<FilterType>('all');

  const totalCount = allConcepts.length;
  const completedCount = isMounted ? readConcepts.length : 0;
  const favoritesCount = isMounted ? favorites.length : 0;
  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredConcepts = allConcepts.filter((c) => {
    if (!isMounted) return filter === 'all';
    if (filter === 'completed') return readConcepts.includes(c.slug);
    if (filter === 'favorites') return favorites.includes(c.slug);
    return true;
  });

  return (
    <section className="my-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-xs">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* 학습 진도 통계 */}
        <div>
          <span className="text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
            학습 진도 현황 (Zustand Persist)
          </span>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-[var(--text-primary)]">
            {completedCount} / {totalCount}개 개념 완료 ({percentage}%)
          </h2>
        </div>

        {/* 필터 탭 버튼 */}
        <div className="inline-flex rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            type="button"
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
              filter === 'all'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            전체 ({totalCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            type="button"
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
              filter === 'completed'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            완료 ({completedCount})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            type="button"
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition-colors ${
              filter === 'favorites'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            즐겨찾기 ({favoritesCount})
          </button>
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 필터링된 개념 목록 */}
      <div className="mt-6 border-t border-[var(--border-subtle)] pt-4">
        {filteredConcepts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConcepts.map((c) => {
              const isRead = isMounted && readConcepts.includes(c.slug);
              const isFav = isMounted && favorites.includes(c.slug);

              return (
                <Link
                  key={c.slug}
                  href={`/${c.axis}/${c.slug}`}
                  className="group flex flex-col justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 shadow-2xs transition-all hover:border-emerald-500/50 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded bg-[var(--border-subtle)] px-2 py-0.5 font-mono text-[10px] text-[var(--text-secondary)]">
                        {c.axis}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        {isRead && (
                          <span title="완료됨" className="text-emerald-500">
                            ✓
                          </span>
                        )}
                        {isFav && (
                          <span title="즐겨찾기" className="text-amber-500">
                            ★
                          </span>
                        )}
                      </div>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {c.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {c.oneLineSummary}
                    </p>
                  </div>
                  <span className="mt-3 inline-block text-right text-xs font-semibold text-emerald-600 transition-transform group-hover:translate-x-1 dark:text-emerald-400">
                    학습하기 →
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-[var(--text-secondary)]">
            해당하는 개념이 없습니다. 개념 상세 페이지에서 완료 또는 즐겨찾기를
            눌러보세요!
          </div>
        )}
      </div>
    </section>
  );
}
