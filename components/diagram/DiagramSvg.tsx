'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import manifest from '@/content/diagrams-manifest.json';

interface DiagramSvgProps {
  diagramId: string;
  verticalDiagramId?: string;
  className?: string;
  title?: string;
  ariaLabel?: string;
}

export function DiagramSvg({
  diagramId,
  verticalDiagramId,
  className = '',
  title,
  ariaLabel,
}: DiagramSvgProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const accessibleLabel = ariaLabel || title || '실행 모델 구조도';

  // 가로(데스크톱) 버전 & 세로(모바일) 버전 SVG
  const horizontalSvg = (manifest as Record<string, string>)[diagramId];
  const resolvedVerticalId = verticalDiagramId || `${diagramId}-vertical`;
  const verticalSvg = (manifest as Record<string, string>)[resolvedVerticalId];

  // 확대 모달 열기/닫기
  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // 모달 닫힌 후 원래 트리거로 포커스 복원
    setTimeout(() => {
      triggerRef.current?.focus();
    }, 50);
  }, []);

  // ESC 키로 닫기 및 스크롤 방지
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 포커스를 닫기 버튼으로 이동
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, closeModal]);

  if (!horizontalSvg && !verticalSvg) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 text-sm text-[var(--text-secondary)]">
        다이어그램({diagramId})을 찾을 수 없습니다. (빌드 파이프라인 확인 필요)
      </div>
    );
  }

  const defaultSvg = horizontalSvg || verticalSvg;

  return (
    <figure className={`my-6 flex flex-col items-center ${className}`}>
      {title && (
        <figcaption className="mb-3 w-full text-center text-sm font-semibold tracking-wide text-[var(--text-secondary)] [text-wrap:balance]">
          {title}
        </figcaption>
      )}

      {/* 키보드(Tab + Enter) 및 마우스/터치 클릭 가능한 인터랙티브 컨테이너 */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={openModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${title || '구조도'} 크게 보기 (클릭 또는 Enter 키)`}
        className="group relative flex w-full cursor-zoom-in justify-center overflow-x-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 sm:p-6 shadow-xs transition-all duration-200 hover:border-sky-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        {/* 상단 안내 힌트 배지 */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] shadow-sm backdrop-blur-xs transition-all duration-200 group-hover:border-sky-500/40 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:scale-105 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
          <span>누르면 크게 볼 수 있어요</span>
        </div>

        {/* 1. 세로 버전 (화면 폭 640px 미만에서만 표시) */}
        {verticalSvg ? (
          <>
            {/* 세로 버전: overflow-x-auto + min-width auto → SVG가 자체 max-width를 유지, 넓으면 가로 스크롤 */}
            <div
              className="block sm:hidden w-full overflow-x-auto [&_svg]:h-auto [&_svg]:w-auto [&_svg]:max-w-none"
              dangerouslySetInnerHTML={{ __html: verticalSvg }}
            />
            {/* 2. 가로 버전 (화면 폭 640px 이상에서만 표시) */}
            <div
              className="hidden sm:flex w-full justify-center [&_svg]:h-auto [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{ __html: horizontalSvg || verticalSvg }}
            />
          </>
        ) : (
          <div
            className="flex w-full justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: defaultSvg }}
          />
        )}
      </div>

      {/* 화면 전체 확대 보기 모달 (Lightbox) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${accessibleLabel} 확대 보기`}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-6 animate-in fade-in duration-200"
            onClick={(e) => {
              // 창 바깥 영역 탭/클릭 시 닫기
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-2xl">
              {/* 모달 상단 헤더 */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    {title || '구조도 확대 보기'}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    ESC 키 또는 바깥 영역을 탭하면 닫힙니다 · 모바일에서 핀치 줌으로 확대 가능
                  </p>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closeModal}
                  aria-label="확대 창 닫기"
                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 모달 내용 영역 (핀치 줌 및 스크롤 지원) */}
              <div
                className="overflow-auto p-4 sm:p-8 flex items-center justify-center touch-pan-x touch-pan-y"
                style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
              >
                {verticalSvg ? (
                  <>
                    {/* 모바일 화면에서는 세로 버전이 크게 표시 (overflow-x-auto로 넓은 SVG 스크롤 지원) */}
                    <div
                      className="block sm:hidden w-full overflow-x-auto [&_svg]:h-auto [&_svg]:w-auto [&_svg]:max-w-none"
                      dangerouslySetInnerHTML={{ __html: verticalSvg }}
                    />
                    {/* 데스크톱 화면에서는 가로 버전이 크게 표시 */}
                    <div
                      className="hidden sm:flex w-full justify-center [&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-5xl"
                      dangerouslySetInnerHTML={{
                        __html: horizontalSvg || verticalSvg,
                      }}
                    />
                  </>
                ) : (
                  <div
                    className="flex w-full justify-center [&_svg]:h-auto [&_svg]:max-w-5xl"
                    dangerouslySetInnerHTML={{ __html: defaultSvg }}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </figure>
  );
}
