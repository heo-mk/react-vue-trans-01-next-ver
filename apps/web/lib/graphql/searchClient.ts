import { SEARCH_QUERY } from './queries';
import type { GraphQLSearchResponse } from './types';
import { toConceptCard, type ConceptCard } from './adapter';

export type SearchErrorKind = 'config' | 'network' | 'http' | 'graphql';

export class SearchError extends Error {
  readonly kind: SearchErrorKind;
  readonly cause?: unknown;

  constructor(kind: SearchErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = 'SearchError';
    this.kind = kind;
    this.cause = cause;
  }
}

/**
 * 브라우저 클라이언트에서 GraphQL API로 개념 검색을 요청하는 함수.
 * 'use client' 컴포넌트(Navbar 등)에서 안전하게 호출할 수 있습니다.
 *
 * @param query 검색어
 * @param signal AbortSignal (취소 제어용)
 * @returns 소문자 axis가 적용된 ConceptCard 배열
 */
export async function searchConceptCards(
  query: string,
  signal?: AbortSignal
): Promise<ConceptCard[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  // Next.js 환경변수 인라인 치환 가이드라인 준수:
  // process.env.NEXT_PUBLIC_GRAPHQL_API_URL 점 표기법을 정적으로 사용하여 함수 호출 시점에 읽음
  let endpoint = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  if (!endpoint) {
    if (process.env.NODE_ENV !== 'production') {
      endpoint = 'http://localhost:4000/';
    } else {
      throw new SearchError(
        'config',
        '검색 서비스 설정 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        new Error('NEXT_PUBLIC_GRAPHQL_API_URL is not set')
      );
    }
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { q: trimmed },
      }),
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    throw new SearchError(
      'network',
      '검색 서버에 연결할 수 없습니다. 네트워크 연결 상태를 확인해 주세요.',
      err
    );
  }

  if (!response.ok) {
    throw new SearchError(
      'http',
      '검색 서버 응답에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      new Error(`HTTP status ${response.status}`)
    );
  }

  let result: {
    data?: GraphQLSearchResponse;
    errors?: Array<{ message: string }>;
  };

  try {
    result = await response.json();
  } catch (err: unknown) {
    throw new SearchError(
      'http',
      '검색 서버 응답을 처리할 수 없습니다.',
      err
    );
  }

  if (result.errors && result.errors.length > 0) {
    throw new SearchError(
      'graphql',
      '검색 결과를 가져오는 중 오류가 발생했습니다.',
      result.errors
    );
  }

  if (!result.data || !Array.isArray(result.data.search)) {
    throw new SearchError(
      'graphql',
      '검색 결과를 올바르게 수신하지 못했습니다.',
      result
    );
  }

  return result.data.search.map(toConceptCard);
}


