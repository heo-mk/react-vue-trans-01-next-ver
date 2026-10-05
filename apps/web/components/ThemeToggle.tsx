'use client';

import { useUiStore } from '@/store/useUiStore';
import { useIsMounted } from './useIsMounted';
import { Tooltip } from './Tooltip';

export function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  const isDark = theme === 'dark';
  const label = isDark ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <Tooltip content={label} position="bottom">
      <button
        onClick={toggleTheme}
        type="button"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-zinc-300 bg-white text-base font-medium text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        aria-label={label}
      >
        <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      </button>
    </Tooltip>
  );
}
