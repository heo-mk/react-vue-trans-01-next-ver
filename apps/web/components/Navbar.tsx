'use client';

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useId,
  type FormEvent,
  type KeyboardEvent,
  type FocusEvent,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { searchConceptCards, SearchError } from '@/lib/graphql/searchClient';
import type { ConceptCard } from '@/lib/graphql/adapter';
import { useIsMounted } from './useIsMounted';

type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export function Navbar() {
  const [inputValue, setInputValue] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<ConceptCard[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const isComposingRef = useRef(false);

  const isMounted = useIsMounted();
  const router = useRouter();
  const listboxId = useId();

  const hasSelectable = status === 'success' && results.length > 0;
  const listboxVisible = isOpen && isMounted && !!coords && hasSelectable;
  const activeOptionId =
    listboxVisible && activeIndex >= 0 && activeIndex < results.length
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  // 활성 항목이 스크롤 영역 밖이면 보이게 한다
  useEffect(() => {
    if (!activeOptionId) return;
    const el = document.getElementById(activeOptionId);
    if (!el) return;
    // 첫 항목이면 맨 위로 올려 제목 줄이 가려지지 않게 한다
    if (activeIndex === 0) {
      const box = el.closest<HTMLElement>('.overflow-y-auto');
      if (box) {
        box.scrollTop = 0;
        return;
      }
    }
    el.scrollIntoView({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOptionId]);

  const updatePosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const margin = 8;

    let width = rect.width;
    let left = rect.left;

    // 뷰포트 초과 방지: 375px 등 작은 화면에서 화면 밖으로 나가지 않도록 좌우 8px 여백 확보
    if (width > viewportWidth - margin * 2) {
      width = viewportWidth - margin * 2;
      left = margin;
    } else {
      if (left < margin) {
        left = margin;
      } else if (left + width > viewportWidth - margin) {
        left = viewportWidth - margin - width;
      }
    }

    setCoords({
      top: rect.bottom + 6,
      left,
      width,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // 바깥 클릭 감지 및 언마운트 시 진행 중 요청 정리
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      abortControllerRef.current?.abort();
    };
  }, []);

  const executeSearch = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) {
      return;
    }

    // 진행 중인 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // 요청 번호 증가 및 현재 번호 캡처
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    setSubmittedQuery(trimmed);
    setStatus('loading');
    setErrorMessage('');
    setActiveIndex(-1);
    setIsOpen(true);

    try {
      const data = await searchConceptCards(trimmed, controller.signal);
      if (requestIdRef.current !== currentRequestId) {
        return;
      }
      setResults(data);
      setStatus('success');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      if (requestIdRef.current !== currentRequestId) {
        return;
      }

      let message = '검색 중 알 수 없는 오류가 발생했습니다.';
      if (err instanceof SearchError) {
        message = err.message;
      }
      setErrorMessage(message);
      setStatus('error');
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isComposingRef.current) {
      return;
    }
    executeSearch(inputValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (
        e.nativeEvent.isComposing ||
        e.keyCode === 229 ||
        isComposingRef.current
      ) {
        return;
      }
      if (!hasSelectable) return;
      e.preventDefault();
      const count = results.length;
      if (e.key === 'ArrowDown') {
        setActiveIndex(activeIndex < 0 ? 0 : (activeIndex + 1) % count);
      } else {
        setActiveIndex(
          activeIndex < 0 ? count - 1 : (activeIndex - 1 + count) % count,
        );
      }
      setIsOpen(true);
      return;
    }

    if (e.key === 'Enter') {
      if (
        e.nativeEvent.isComposing ||
        e.keyCode === 229 ||
        isComposingRef.current
      ) {
        e.preventDefault();
        return;
      }
      if (listboxVisible && activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        const active = results[activeIndex];
        handleSelect(active.axis, active.slug);
        return;
      }
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStatus('idle');
    setSubmittedQuery('');
    setResults([]);
    setErrorMessage('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleSelect = (axis: string, slug: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setInputValue('');
    setSubmittedQuery('');
    setResults([]);
    setStatus('idle');
    setErrorMessage('');
    setActiveIndex(-1);
    setIsOpen(false);
    router.push(`/${axis}/${slug}`);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
    const related = e.relatedTarget as Node | null;
    if (
      containerRef.current?.contains(related) ||
      dropdownRef.current?.contains(related)
    ) {
      return;
    }
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleQuickKeyword = (keyword: string) => {
    setInputValue(keyword);
    executeSearch(keyword);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 h-16 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] isolate [contain:paint] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
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
        <div
          ref={containerRef}
          onBlur={handleContainerBlur}
          className="relative max-w-md flex-1"
        >
          <form
            role="search"
            onSubmit={handleSubmit}
            className="relative flex items-center"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setActiveIndex(-1);
              }}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={listboxVisible}
              aria-controls={listboxVisible ? listboxId : undefined}
              aria-activedescendant={activeOptionId}
              placeholder="개념 검색 (예: useState, ref, RSC, Zustand)..."
              aria-label="개념 검색"
              className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)] pl-3.5 pr-16 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors focus:border-emerald-500 focus:outline-hidden"
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="입력값 지우기"
                  className="flex h-6 w-6 items-center justify-center text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                aria-label="검색"
                className="flex h-6 w-6 items-center justify-center rounded text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {/* 테마 토글 */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* 검색 결과 및 추천 검색어 포털 드롭다운 (헤더 contain:paint 밖으로 탈출) */}
      {isOpen &&
        isMounted &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            data-testid="search-dropdown"
            tabIndex={-1}
            onMouseDown={(e) => {
              // 버튼 클릭 시 입력창 blur로 박스가 먼저 닫히지 않도록 기본동작 방지
              e.preventDefault();
            }}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className="z-[60] max-h-72 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-2 shadow-lg"
          >
            {/* aria-live 영역: 상태 문구 및 헤더 */}
            <div aria-live="polite">
              {status === 'loading' && (
                <div
                  data-testid="search-status"
                  className="py-6 text-center text-xs text-[var(--text-secondary)]"
                >
                  검색 중…
                </div>
              )}

              {status === 'error' && (
                <div
                  data-testid="search-status"
                  className="py-4 text-center text-xs text-red-500 dark:text-red-400"
                >
                  {errorMessage}
                </div>
              )}

              {status === 'success' && results.length > 0 && (
                <div>
                  <div
                    data-testid="search-heading"
                    className="px-2.5 py-1.5 text-[11px] font-medium text-[var(--text-secondary)]"
                  >
                    &apos;{submittedQuery}&apos; 검색 결과 {results.length}건
                  </div>
                  <ul id={listboxId} role="listbox" aria-label="검색 결과" className="space-y-1">
                    {results.map((c, i) => (
                      <li
                        key={c.slug}
                        id={`${listboxId}-option-${i}`}
                        role="option"
                        aria-selected={i === activeIndex}
                        tabIndex={-1}
                        data-testid="search-result-item"
                        onClick={() => handleSelect(c.axis, c.slug)}
                        className={`flex w-full cursor-pointer flex-col gap-0.5 rounded-lg p-2.5 text-left transition-colors hover:bg-[var(--bg-secondary)] ${
                          i === activeIndex ? 'bg-[var(--bg-secondary)]' : ''
                        }`}
                      >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[var(--text-primary)]">
                              {c.cardTitle || c.title}
                            </span>
                            <span className="rounded bg-[var(--border-subtle)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                              {c.axis}
                            </span>
                          </div>
                          <span className="line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                            {c.cardSubtitle
                              ? `${c.cardSubtitle} · ${c.oneLineSummary}`
                              : c.oneLineSummary}
                          </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 결과 없음: Navbar 기존 문구 유지 */}
              {status === 'success' && results.length === 0 && (
                <div
                  data-testid="search-status"
                  className="py-4 text-center text-xs text-[var(--text-secondary)]"
                >
                  <div>일치하는 개념이 없습니다.</div>
                  <div className="mt-1.5 text-[11px] text-[var(--text-secondary)]/80">
                    추천 검색어:{' '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('useState')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      useState
                    </button>
                    {', '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('ref')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      ref
                    </button>
                    {', '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('RSC')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      RSC
                    </button>
                    {', '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('Zustand')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Zustand
                    </button>
                  </div>
                </div>
              )}

              {/* 초기 상태(idle)에서 입력창에 초점이 있을 때: 추천 검색어 화면 */}
              {status === 'idle' && (
                <div className="py-3 text-center text-xs text-[var(--text-secondary)]">
                  <div className="text-[11px] text-[var(--text-secondary)]/80">
                    추천 검색어:{' '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('useState')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      useState
                    </button>
                    {', '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('ref')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      ref
                    </button>
                    {', '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('RSC')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      RSC
                    </button>
                    {', '}
                    <button
                      type="button"
                      data-testid="search-recommend"
                      onClick={() => handleQuickKeyword('Zustand')}
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      Zustand
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
