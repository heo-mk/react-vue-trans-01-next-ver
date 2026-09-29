'use client';

import { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'bottom',
  className = '',
}: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-900 dark:border-t-zinc-800 border-x-transparent border-b-transparent border-t-4 border-x-4 border-b-0',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-900 dark:border-b-zinc-800 border-x-transparent border-t-transparent border-b-4 border-x-4 border-t-0',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-900 dark:border-l-zinc-800 border-y-transparent border-r-transparent border-l-4 border-y-4 border-r-0',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-900 dark:border-r-zinc-800 border-y-transparent border-l-transparent border-r-4 border-y-4 border-l-0',
  };

  return (
    <div className={`group relative inline-flex items-center justify-center ${className}`}>
      {children}
      <div
        role="tooltip"
        className={`pointer-events-none absolute z-50 flex items-center justify-center invisible opacity-0 scale-95 transition-all duration-150 ease-out group-hover:visible group-hover:opacity-100 group-hover:scale-100 group-has-[:focus-visible]:visible group-has-[:focus-visible]:opacity-100 group-has-[:focus-visible]:scale-100 ${positionClasses[position]}`}
      >
        <div className="relative rounded-md border border-zinc-700/50 bg-zinc-900/95 px-2.5 py-1 text-[11px] font-medium tracking-normal text-zinc-100 shadow-md backdrop-blur-xs whitespace-nowrap dark:border-zinc-700/70 dark:bg-zinc-800/95 dark:text-zinc-100">
          {content}
          <div className={`absolute h-0 w-0 ${arrowClasses[position]}`} />
        </div>
      </div>
    </div>
  );
}
