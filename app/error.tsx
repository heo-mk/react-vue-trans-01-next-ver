'use client';

import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ reset }: ErrorProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
        <span>⚠️</span> 일시적 렌더링 오류
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--text-primary)]">
        페이지를 불러오는 중 문제가 발생했습니다
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        요청을 처리하는 도중 예기치 않은 오류가 발생했습니다.
        아래 버튼을 눌러 다시 시도하거나 홈 화면으로 이동할 수 있습니다.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => reset()}
          type="button"
          className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-primary)]"
        >
          홈으로 이동
        </Link>
      </div>
    </div>
  );
}
