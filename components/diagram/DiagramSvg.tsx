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

  // 줌 상태 관리
  const [scale, setScale] = useState(1);
  const scaleRef = useRef(scale);
  scaleRef.current = scale;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const [baseSize, setBaseSize] = useState<{ width: number; height: number } | null>(null);

  // 모달 열림/닫힘 시 초기화 및 스크롤 맨 위로 리셋
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setBaseSize(null);
      return;
    }

    // 모달 열릴 때 스크롤 위치 (0, 0) 보장
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollLeft = 0;
    }

    const timer = setTimeout(() => {
      if (contentWrapperRef.current) {
        const w = contentWrapperRef.current.offsetWidth;
        const h = contentWrapperRef.current.offsetHeight;
        if (w > 0 && h > 0) {
          setBaseSize({ width: w, height: h });
        }
      }
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
        scrollContainerRef.current.scrollLeft = 0;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // 창 크기 변경 시 기본 크기 재측정 (scale이 1일 때만)
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (scaleRef.current === 1 && contentWrapperRef.current) {
        const w = contentWrapperRef.current.offsetWidth;
        const h = contentWrapperRef.current.offsetHeight;
        if (w > 0 && h > 0) {
          setBaseSize({ width: w, height: h });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // 줌 변경 함수
  const handleZoomChange = useCallback(
    (newScale: number) => {
      const clamped = Math.min(Math.max(Number(newScale.toFixed(2)), 1), 3);
      if (!baseSize && contentWrapperRef.current) {
        const w = contentWrapperRef.current.offsetWidth;
        const h = contentWrapperRef.current.offsetHeight;
        if (w > 0 && h > 0) {
          setBaseSize({ width: w, height: h });
        }
      }
      setScale(clamped);
    },
    [baseSize]
  );

  // 모바일 2손가락 핀치 줌 제스처 지원 (한 손가락 스크롤과 상호 간섭 없음)
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!isOpen || !el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchStartDistRef.current = dist;
        touchStartScaleRef.current = scaleRef.current;
        if (!baseSize && contentWrapperRef.current) {
          const w = contentWrapperRef.current.offsetWidth;
          const h = contentWrapperRef.current.offsetHeight;
          if (w > 0 && h > 0) {
            setBaseSize({ width: w, height: h });
          }
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistRef.current !== null) {
        if (e.cancelable) e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = dist / touchStartDistRef.current;
        const nextScale = Math.min(
          Math.max(touchStartScaleRef.current * ratio, 1),
          3
        );
        setScale(Number(nextScale.toFixed(2)));
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStartDistRef.current = null;
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isOpen, baseSize]);

  if (!horizontalSvg && !verticalSvg) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 text-sm text-[var(--text-secondary)]">
        다이어그램({diagramId})을 찾을 수 없습니다.
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 backdrop-blur-xs sm:p-6 animate-in fade-in duration-200"
            onClick={(e) => {
              // 창 바깥 영역 탭/클릭 시 닫기
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="relative flex max-h-[92vh] [max-height:92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-2xl">
              {/* 모달 상단 헤더 */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3 sm:px-5 sm:py-4">
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate pr-2">
                  {title || '구조도 확대 보기'}
                </h4>
                <div className="flex items-center gap-2 shrink-0">
                  {/* 확대 / 축소 / 리셋 컨트롤 */}
                  <div className="flex items-center gap-0.5 sm:gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleZoomChange(scale - 0.25)}
                      disabled={scale <= 1}
                      aria-label="축소"
                      className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleZoomChange(1)}
                      aria-label="원래 크기 (100%)"
                      className="min-w-[38px] px-1 py-0.5 text-center font-mono text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      {Math.round(scale * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => handleZoomChange(scale + 0.25)}
                      disabled={scale >= 3}
                      aria-label="확대"
                      className="flex h-7 w-7 items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* 닫기 버튼 */}
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
              </div>

              {/* 모달 내용 영역 (스크롤 컨테이너) */}
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-auto touch-pan-x touch-pan-y"
                style={{ touchAction: 'pan-x pan-y' }}
              >
                {/* 
                  중앙 정렬 래퍼:
                  - flex min-h-full min-w-full로 스크롤 컨테이너 가용 영역 확보
                  - 자식(sizer)에 m-auto를 적용하여:
                    1) 컨텐츠가 창보다 작을 때: 남는 양수 공간을 고르게 분배하여 상하/좌우 완벽한 중앙 정렬
                    2) 컨텐츠가 창보다 클 때: CSS Flexbox 스펙상 음수 여백은 0으로 자동 수렴하여,
                       위쪽/왼쪽이 잘리지 않고 (0, 0)에서 시작하며 전체 영역을 끝까지 스크롤 가능
                */}
                <div className="flex min-h-full min-w-full p-4 sm:p-8">
                  <div
                    className={`m-auto shrink-0 flex flex-col items-center ${
                      scale === 1 ? 'w-full max-w-5xl' : ''
                    }`}
                    style={{
                      width:
                        scale > 1 && baseSize
                          ? `${baseSize.width * scale}px`
                          : undefined,
                      height:
                        scale > 1 && baseSize
                          ? `${baseSize.height * scale}px`
                          : undefined,
                    }}
                  >
                    <div
                      ref={contentWrapperRef}
                      className={`flex flex-col items-center ${
                        scale === 1 ? 'w-full max-w-5xl' : ''
                      }`}
                      style={{
                        width:
                          scale > 1 && baseSize
                            ? `${baseSize.width}px`
                            : undefined,
                        height:
                          scale > 1 && baseSize
                            ? `${baseSize.height}px`
                            : undefined,
                        transform: scale > 1 ? `scale(${scale})` : undefined,
                        transformOrigin: '0 0',
                      }}
                    >
                      {verticalSvg ? (
                        <>
                          {/* 모바일 화면에서는 세로 버전 표시 */}
                          <div
                            className="block sm:hidden w-full [&_svg]:h-auto [&_svg]:w-auto [&_svg]:max-w-none"
                            dangerouslySetInnerHTML={{ __html: verticalSvg }}
                          />
                          {/* 데스크톱 화면에서는 가로 버전 표시 */}
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
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </figure>
  );
}
