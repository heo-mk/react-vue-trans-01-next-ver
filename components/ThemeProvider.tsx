'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store/useUiStore';
import { useIsMounted } from './useIsMounted';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((state) => state.theme);
  const isMounted = useIsMounted();

  useEffect(() => {
    if (!isMounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isMounted]);

  return <>{children}</>;
}
