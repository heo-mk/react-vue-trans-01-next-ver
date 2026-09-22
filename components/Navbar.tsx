'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { allConcepts } from '@/content/index';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  const filteredConcepts = searchQuery.trim()
    ? allConcepts.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.oneLineSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelect = (axis: string, slug: string) => {
    setSearchQuery('');
    setIsFocused(false);
    router.push(`/${axis}/${slug}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        {/* 로고 */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
            ⇄
          </span>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              React ↔ Vue 가이드
            </span>
          </div>
        </Link>

        {/* 중앙 빠른 검색창 */}
        <div className="relative max-w-md flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="개념 검색 (예: useState, proxy, RSC, ref)..."
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-3.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors focus:border-emerald-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* 검색 결과 드롭다운 */}
          {isFocused && searchQuery.trim() && (
            <div className="absolute top-full right-0 left-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 shadow-lg">
              {filteredConcepts.length > 0 ? (
                <ul className="space-y-1">
                  {filteredConcepts.map((c) => (
                    <li key={c.slug}>
                      <button
                        onMouseDown={() => handleSelect(c.axis, c.slug)}
                        className="flex w-full flex-col gap-0.5 rounded-lg p-2.5 text-left transition-colors hover:bg-[var(--bg-secondary)]"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {c.title}
                          </span>
                          <span className="rounded bg-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                            {c.axis}
                          </span>
                        </div>
                        <span className="line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                          {c.oneLineSummary}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center text-xs text-[var(--text-secondary)]">
                  일치하는 개념이 없습니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 테마 토글 */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
