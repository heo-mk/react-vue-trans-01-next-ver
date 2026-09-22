import { ConceptPage } from '../../schema';

export const serverState: ConceptPage = {
  slug: 'server-state',
  axis: 'react-vue',
  title: '서버 상태 관리 (TanStack Query ↔ Vue Query / Composable)',
  oneLineSummary:
    '서버 데이터는 내 컴퓨터의 물건이 아니라 원격 도서관의 책이므로, 언제든 바뀔 수 있는 책의 복사본을 유효기간(staleTime) 동안만 읽고 제때 반납·갱신(재검증)해 주는 전담 사서가 바로 서버 상태 관리 도구입니다.',
  analogy:
    'Promise는 출처를 묻지 않는 밀봉된 배송 봉투와 같고, TanStack Query는 그 봉투의 내용물이 아니라 겉면의 배송 상태(기다리는 중·성공·실패 상태 기계)를 전문적으로 관리하는 관제 센터입니다.',
  sourceNote:
    '01_통합보고서 3-3 "TanStack Query의 내부 원리" 및 TkDodo 블로그 철학 인용',
  diagramId: 'server-state-diagram',
  comparisonTable: [
    {
      label: '서버 상태 vs 클라이언트 상태',
      left: '서버 상태: 비동기적 소유권이 원격 서버에 있음. 캐싱, 백그라운드 재검증(Refetch), 중복 요청 제거, 에러/로딩 상태 기계 관리 필수.',
      right:
        '클라이언트 상태: 모달 열림, 다크모드, 폼 입력 등 프론트엔드 앱이 온전히 소유한 동기적 UI 데이터. 캐싱 만료 개념 부재.',
    },
    {
      label: 'React vs Vue 표준 도구 생태계',
      left: 'React 생태계: 사실상 표준인 TanStack Query(v5)를 사용하여 `useQuery`, `useMutation`으로 서버 상태를 전담 분리.',
      right:
        'Vue 생태계: 공식 이식작인 `@tanstack/vue-query`가 정착. Nuxt 3 환경에서는 내장된 `useFetch` / `useAsyncData`를 적극 병용.',
    },
    {
      label: '캐시 생명주기 제어 (staleTime vs gcTime)',
      left: 'staleTime: 캐시 데이터가 "신선한 상태"로 유지되어 재요청 없이 바로 재사용되는 유효기간 (기본값: 0초).',
      right:
        'gcTime(구 cacheTime): 화면에서 컴포넌트가 언마운트되어 구독자가 0명이 된 후 메모리에서 폐기되기 전까지 보관되는 유예기간 (기본값: 5분).',
    },
    {
      label: '데이터 갱신 트리거 (invalidateQueries)',
      left: '모든 데이터를 강제로 즉시 재호출하는 것이 아니라, 해당 캐시를 "오래됨(Stale)"으로 마킹한 뒤 현재 화면에 마운트된 활성 쿼리만 선별 리패치.',
      right:
        '화면에 보이지 않는 비활성 쿼리는 나중에 화면에 다시 진입할 때 백그라운드에서 신선한 데이터를 자동으로 동기화.',
    },
    {
      label: '단일 진실 원천(SSOT)과 안티패턴',
      left: '서버에서 가져온 데이터를 Zustand/Redux 스토어에 복사해 넣는 행위는 캐시 불일치와 중복 상태를 양산하는 대표적 반(反)패턴.',
      right:
        '서버 데이터는 TanStack Query 캐시 자체를 단일 진실 공급원으로 삼고, Pinia나 Zustand에는 순수 UI 제어 플래그만 격리 유지.',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'React 18+ (TanStack Query v5) vs Vue 3.4+ (TanStack Vue Query v5)',
      leftCode: `// [React] TanStack Query v5 — useQuery를 통한 서버 상태 조회
import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
}

export function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, isError, error } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(\`/api/users/\${userId}\`);
      if (!res.ok) throw new Error('사용자 조회 실패');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5분 동안은 신선한 데이터로 취급 (백그라운드 재요청 방지)
    gcTime: 1000 * 60 * 10,   // 컴포넌트가 사라져도 10분간 메모리 보존
  });

  if (isLoading) return <div>사서가 책을 찾아오는 중...</div>;
  if (isError) return <div>조회 실패: {error.message}</div>;

  return <div>사용자 이름: {data?.name}</div>;
}`,
      rightCode: `<!-- [Vue] TanStack Vue Query v5 — Composable 기반 서버 상태 조회 -->
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

interface User {
  id: string;
  name: string;
}

const props = defineProps<{ userId: string }>();

// queryKey를 getter 함수로 넘기면 userId props 변경을 자동으로 감지하여 리패치
const { data, isLoading, isError, error } = useQuery<User>({
  queryKey: () => ['user', props.userId],
  queryFn: async () => {
    const res = await fetch(\`/api/users/\${props.userId}\`);
    if (!res.ok) throw new Error('사용자 조회 실패');
    return res.json();
  },
  staleTime: 1000 * 60 * 5,
  gcTime: 1000 * 60 * 10,
});
</script>

<template>
  <div v-if="isLoading">사서가 책을 찾아오는 중...</div>
  <div v-else-if="isError">조회 실패: {{ error?.message }}</div>
  <div v-else>사용자 이름: {{ data?.name }}</div>
</template>`,
    },
    {
      label: '기초 예제',
      version: 'React 18+ vs Vue 3.4+ (useMutation 낙관적 업데이트)',
      leftCode: `// [React] 낙관적 업데이트 3단계 사이클 (onMutate -> onError -> onSettled)
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTodo: { id: string; title: string }) =>
      fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodo) }),
    
    // 1단계: API 요청 직전 기존 캐시 백업 및 UI 먼저 선반영
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old: any[] = []) => [...old, newTodo]);
      return { previousTodos }; // onError의 컨텍스트로 전달
    },

    // 2단계: 서버 요청 실패 시 백업 스냅샷으로 즉시 원복
    onError: (_err, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },

    // 3단계: 성공이든 실패든 서버의 진짜 최신 데이터와 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}`,
      rightCode: `// [Vue] Vue Query v5에서의 낙관적 업데이트 구현
import { useMutation, useQueryClient } from '@tanstack/vue-query';

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTodo: { id: string; title: string }) =>
      fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodo) }),

    // 1단계: 기존 캐시 스냅샷 저장 및 화면 먼저 변경
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] });
      const previousTodos = queryClient.getQueryData(['todos']);
      queryClient.setQueryData(['todos'], (old: any[] = []) => [...old, newTodo]);
      return { previousTodos };
    },

    // 2단계: 실패 시 롤백
    onError: (_err, _newTodo, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos);
      }
    },

    // 3단계: 최종 서버 정합성 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}`,
    },
    {
      label: '실전 예제',
      version:
        'React 18+ (TanStack Query + Zustand) vs Vue 3.4+ (Vue Query + Pinia)',
      sourceProject: 'GitFind Dashboard',
      leftCode: `// [React] 포트폴리오 실전: GitFind Dashboard / src/hooks/useRepoMutations.ts
// 즐겨찾기 토글 시 낙관적 업데이트와 실패 시 스냅샷 복원
export function useToggleBookmarkMutation(bookmarks: Repo[], setBookmarks: (repos: Repo[]) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repo: Repo) => toggleBookmarkApi(repo.id),
    onMutate: async (repo) => {
      // 1. 진행 중인 리패치 취소하여 낙관적 업데이트 덮어쓰기 방지
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      // 2. 롤백을 위한 이전 상태 스냅샷 복사 (불변성 보장)
      const previousBookmarks = [...bookmarks];
      // 3. UI 즉시 낙관적 업데이트
      const exists = bookmarks.some((b) => b.id === repo.id);
      const next = exists ? bookmarks.filter((b) => b.id !== repo.id) : [...bookmarks, repo];
      setBookmarks(next);
      return { previousBookmarks };
    },
    onError: (_error, _repo, context) => {
      // 4. 에러 발생 시 백업 스냅샷으로 즉시 롤백
      if (context?.previousBookmarks) {
        setBookmarks(context.previousBookmarks);
      }
    },
    onSettled: () => {
      // 5. 서버 진실값과 최종 재동기화
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}`,
      rightCode: `// [Vue] Vue 3.4+ Vue Query — useMutation을 통한 동일 로직 이식
import { useMutation, useQueryClient } from '@tanstack/vue-query';

export function useToggleBookmarkMutation(bookmarkStore: ReturnType<typeof useBookmarkStore>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repo: Repo) => toggleBookmarkApi(repo.id),
    onMutate: async (repo) => {
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      const previousBookmarks = [...bookmarkStore.bookmarks];
      bookmarkStore.toggle(repo);
      return { previousBookmarks };
    },
    onError: (_err, _repo, context) => {
      if (context?.previousBookmarks) {
        bookmarkStore.bookmarks = context.previousBookmarks;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}`,
    },
    {
      label: '실전 예제',
      version:
        'React 18+ (TanStack Query useInfiniteQuery) vs Vue 3.4+ (Vue Query useInfiniteQuery)',
      sourceProject: 'GitFind Dashboard',
      leftCode: `// [React] 포트폴리오 실전: GitFind Dashboard / src/hooks/useRepoSearch.ts
// 외부 API의 total_count 부정확성에 대비한 무한 스크롤 이중 종료 방어 조건
export function useRepoSearch(query: string) {
  return useInfiniteQuery({
    queryKey: ['repos', 'search', query],
    queryFn: ({ pageParam = 1 }) => fetchReposApi(query, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, p) => sum + p.items.length, 0);
      // 이중 방어 조건:
      // 1. 이번 페이지 결과가 페이지 사이즈(10개) 미만이면 마지막 페이지
      // 2. 누적 수신 개수가 API의 total_count 이상이면 종료
      if (lastPage.items.length < 10 || fetchedCount >= lastPage.total_count) {
        return undefined; // 더 이상 페이지 없음
      }
      return allPages.length + 1;
    },
  });
}`,
      rightCode: `// [Vue] Vue 3.4+ Vue Query — 동일한 getNextPageParam 방어 로직 공유
import { useInfiniteQuery } from '@tanstack/vue-query';

export function useRepoSearch(query: Ref<string>) {
  return useInfiniteQuery({
    queryKey: () => ['repos', 'search', query.value],
    queryFn: ({ pageParam = 1 }) => fetchReposApi(query.value, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, p) => sum + p.items.length, 0);
      // TanStack 코어 로직이 동일하므로 프레임워크와 무관하게 완전히 동일하게 동작
      if (lastPage.items.length < 10 || fetchedCount >= lastPage.total_count) {
        return undefined;
      }
      return allPages.length + 1;
    },
  });
}`,
    },
    {
      label: '실전 예제',
      version: 'React 18+ (TanStack Query) vs Vue 3.4+ (Vue Query / Composable)',
      sourceProject: 'smartstore-item-finder',
      leftCode: `// [React] 포트폴리오 실전: smartstore-item-finder
// 동일 키워드 재검색 시 queryKey 캐시 우회 및 refetch 강제 트리거
export function SearchSection() {
  const searchResultRef = useRef<{ refetch: () => void }>(null);
  const [lastKeyword, setLastKeyword] = useState('');

  const handleSearch = (keyword: string) => {
    if (keyword === lastKeyword) {
      // queryKey가 같으면 React Query는 기본적으로 재요청하지 않으므로 직접 refetch 호출
      searchResultRef.current?.refetch();
    } else {
      setLastKeyword(keyword);
    }
  };

  return <SearchBar onSearch={handleSearch} />;
}`,
      rightCode: `// [Vue] Vue 3.4+ Vue Query — 템플릿 ref를 통한 자식 컴포넌트 refetch 트리거
<script setup lang="ts">
import { ref } from 'vue';

const lastKeyword = ref('');
const resultRef = ref<{ refetch: () => void } | null>(null);

function handleSearch(keyword: string) {
  if (keyword === lastKeyword.value) {
    // Vue Query 역시 코어 캐싱 철학이 동일하여 동일 키워드는 기본 재요청 안 됨
    resultRef.value?.refetch();
  } else {
    lastKeyword.value = keyword;
  }
}
</script>`,
    },
    {
      label: '실전 예제',
      version: 'React 18+ (TanStack Query) vs Vue 3.4+ (Vue Query / useFetch)',
      sourceProject: '퇴직금 회수 가이드',
      leftCode: `// [React] 포트폴리오 실전: 퇴직금 회수 가이드 / frontend/src/api/legalQueries.ts
// 법령·판례 데이터의 도메인 특성(국회 심의·개정 주기)을 고려한 1시간 staleTime 정책
export function useStatutesQuery(keyword: string) {
  return useQuery({
    queryKey: ['statutes', keyword],
    queryFn: () => fetchStatutes(keyword),
    enabled: keyword.length > 0,
    staleTime: 1000 * 60 * 60, // 1시간 동안 신선한 데이터로 간주 (캐시 재사용)
    gcTime: 1000 * 60 * 60 * 2,  // 2시간 동안 메모리에 캐시 유지
  });
}`,
      rightCode: `// [Vue] Vue 3.4+ Vue Query — 동일한 도메인 기반 staleTime 적용
import { useQuery } from '@tanstack/vue-query';

export function useStatutesQuery(keyword: Ref<string>) {
  return useQuery({
    queryKey: () => ['statutes', keyword.value],
    queryFn: () => fetchStatutes(keyword.value),
    enabled: () => keyword.value.length > 0,
    staleTime: 1000 * 60 * 60, // 1시간 (도메인 분석 기반 결정)
    gcTime: 1000 * 60 * 60 * 2,
  });
}`,
    },
  ],
  pitfalls: [
    {
      question:
        '낙관적 업데이트(Optimistic Update)는 서버 확정 전인데 성공한 것처럼 보여줘 사용자를 속이는 것 아닌가요? 연속 클릭 시 스냅샷이 꼬이지 않나요?',
      answer:
        '낙관적 업데이트는 사용자 경험(UX)을 극대화하기 위한 의도된 트레이드오프입니다. 북마크나 좋아요처럼 실패 확률이 낮고 롤백 비용이 적은 인터랙션에서는 즉각적인 피드백의 가치가 큽니다(단, 금융 결제처럼 실패 비용이 큰 작업에는 절대 금기). 연속 클릭 시 스냅샷이 꼬이는 문제는 실제 취약점이 맞습니다. A, B 요청이 빠르게 겹칠 경우 나중에 실패한 롤백이 중간 변경을 덮어쓸 수 있습니다. 실무에서는 `mutationKey`를 통한 쿼리 직렬화나 낙관적 상태에 임시 ID/버전 번호를 부여하여 충돌을 방지하는 방향으로 고도화할 수 있습니다.',
    },
    {
      question:
        '무한 스크롤 getNextPageParam에서 그냥 total_count만 확인하면 되는데 왜 굳이 페이지 아이템 수(< 10)까지 이중으로 체크했나요?',
      answer:
        '외부 API(예: GitHub REST API)가 응답하는 `total_count`는 실시간 인덱싱 지연이나 권한 필터링 등으로 인해 실제 조회 가능한 데이터 개수와 불일치하거나 오차가 발생하는 경우가 빈번합니다. 만약 `total_count`만 맹신하면 이미 더 이상 데이터가 없음에도 다음 페이지를 끊임없이 헛요청하는 무한 루프 버그가 생길 수 있습니다. 따라서 클라이언트가 직접 수신한 "아이템 개수"로 1차 검증하고, total_count로 2차 검증하는 방어적 프로그래밍(Defensive Programming)을 적용했습니다.',
    },
    {
      question:
        '동일 키워드 재검색을 위해 부모가 ref로 자식의 refetch 함수를 직접 호출하는 것은 React의 단방향 데이터 흐름을 깨뜨리는 안티패턴 아닌가요?',
      answer:
        '데이터를 아래로 전달하는 흐름 관점에서는 일반적인 패턴이 아님을 인정합니다. 하지만 이것은 상태를 전달하는 것이 아니라 일회성 "명령(Imperative Action)"을 트리거하는 것이므로, `useImperativeHandle`과 같은 맥락의 실용적 탈출구로 활용되었습니다. 더 원칙적이고 이상적인 대안은 검색 쿼리 상태 자체를 부모로 완전히 끌어올리거나, 동일 키워드라도 검색 클릭 시점의 타임스탬프를 쿼리 키에 포함시켜 자연스럽게 재요청을 유도하는 설계이며, 리팩터링 시 1순위로 고려할 부분입니다.',
    },
    {
      question:
        '퇴직금 회수 가이드에서 법령 데이터의 staleTime을 1시간으로 설정한 명확한 기술적·도메인적 근거는 무엇인가요?',
      answer:
        'staleTime 기본값(0초)을 무지성으로 사용하지 않고 데이터의 실세계 도메인 라이프사이클을 분석했습니다. 법령 및 판례 데이터는 국회 심의와 공포 절차를 거치므로 주식 시세처럼 분/초 단위로 바뀌지 않으며 변경 주기가 수개월 단위입니다. 1시간은 불필요한 공공 API 트래픽을 원천 차단하면서도, 당일 발생한 법률 개정을 신속히 반영할 수 있는 가장 안전한 실용적 값입니다. 향후 개선한다면 공공 API 응답의 최종 수정일(Last-Modified) 메타데이터를 기반으로 한 조건부 캐시 무효화가 최선의 대안입니다.',
    },
    {
      question:
        'TanStack Query가 서버 상태 관리용 라이브러리라면, 왜 queryFn에 로컬스토리지나 Mock 함수를 넣어도 정상 동작하나요?',
      answer:
        'TanStack Query의 기술적 계약(Interface Contract)은 "HTTP 서버를 호출하는 함수"가 아니라 오직 "Promise를 반환하는 함수"이기 때문입니다. Promise는 출처를 묻지 않는 포장 봉투와 같아서, 브라우저 스토리지 읽기든 타이머 기반 가짜 데이터든 비동기 Promise 형태로만 반환되면 TanStack Query의 상태 기계(Pending → Success/Error)는 출처와 상관없이 동일하게 동작합니다. "서버 상태"라는 단어는 라이브러리가 가장 빛을 발하는 핵심 활용 시나리오를 지칭하는 표현입니다.',
    },
    {
      question:
        'staleTime과 gcTime(구 cacheTime)의 차이를 설명하고, staleTime의 기본값이 0초인 이유는 무엇인가요?',
      answer:
        'staleTime은 "캐시된 데이터가 여전히 신선하여 서버에 재요청하지 않아도 되는 유효기간"이고, gcTime은 "화면에서 사용되지 않는(언마운트된) 데이터를 가비지 컬렉터가 메모리에서 지우기 전까지 유지하는 보관 기간"입니다. TanStack Query는 기본적으로 staleTime이 0초로 설정되어 있는데, 이는 "화면에 캐시 데이터를 즉시 보여주되(빠른 체감 속도), 데이터가 언제든 서버에서 바뀔 수 있으므로 항상 백그라운드에서 조용히 재검증(Stale-While-Revalidate)하여 최신성을 보장한다"는 기본 철학을 반영한 설계입니다.',
    },
    {
      question:
        'queryClient.invalidateQueries()를 실행하면 캐시된 모든 데이터가 그 즉시 서버로 재호출되나요?',
      answer:
        '아닙니다. `invalidateQueries`는 즉각적인 네트워크 폭풍을 일으키지 않습니다. 먼저 지정된 쿼리 키의 데이터를 "오래됨(Stale)" 상태로 마킹한 뒤, 오직 "현재 화면에 마운트되어 활발히 사용 중인 쿼리"만 즉시 백그라운드에서 다시 가져옵니다. 현재 화면에 렌더링되지 않은 비활성(Inactive) 쿼리는 재요청하지 않고 마킹만 남겨두며, 사용자가 나중에 해당 화면으로 다시 진입할 때 비로소 최신 데이터를 패치합니다.',
    },
    {
      question:
        'API로 받아온 서버 데이터를 Zustand나 Pinia 같은 전역 스토어에 다시 복사해서 저장하는 것은 왜 안티패턴인가요?',
      answer:
        '단일 진실 원천(Single Source of Truth) 원칙이 깨지기 때문입니다. 서버 데이터를 클라이언트 전역 스토어에 복제하면, TanStack Query가 수행하는 자동 캐시 갱신, 백그라운드 리패칭, 낙관적 업데이트의 결과가 전역 스토어에는 반영되지 않아 화면 간 데이터 불일치(Data Desynchronization)가 발생합니다. 따라서 서버 데이터는 TanStack Query 캐시 자체를 단일 원천으로 바라보고, Zustand/Pinia에는 모달 상태나 선택된 필터 같은 순수 UI 상태만 보관해야 합니다.',
    },
  ],
  sources: [
    {
      label: 'TanStack Query 공식 문서 — Important Defaults & Thinking in React Query',
      url: 'https://tanstack.com/query/latest',
    },
    {
      label: 'TkDodo: Practical React Query & Inside React Query Series',
      url: 'https://tkdodo.eu/blog/practical-react-query',
    },
  ],
};
