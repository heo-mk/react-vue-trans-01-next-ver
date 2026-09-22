'use client';

import manifest from '@/content/diagrams-manifest.json';

interface DiagramSvgProps {
  diagramId: string;
  className?: string;
  title?: string;
}

export function DiagramSvg({ diagramId, className = '', title }: DiagramSvgProps) {
  const svgContent = (manifest as Record<string, string>)[diagramId];

  if (!svgContent) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 text-sm text-[var(--text-secondary)]">
        다이어그램({diagramId})을 찾을 수 없습니다. (빌드 파이프라인 확인 필요)
      </div>
    );
  }

  return (
    <figure className={`my-6 flex flex-col items-center ${className}`}>
      {title && (
        <figcaption className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {title}
        </figcaption>
      )}
      <div
        className="w-full overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 shadow-xs flex justify-center transition-colors duration-200 [&_svg]:max-w-full [&_svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </figure>
  );
}
