'use client';

import { useUiStore } from '@/store/useUiStore';
import { useIsMounted } from './useIsMounted';

export function ThemeToggle() {
  const { theme, toggleTheme } = useUiStore();
  const isMounted = useIsMounted();

  if (!isMounted) {
    return (
      <div className="h-9 w-28 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      aria-label="테마 전환"
    >
      <span>{theme === 'dark' ? '🌙 다크 모드' : '☀️ 라이트 모드'}</span>
    </button>
  );
}
