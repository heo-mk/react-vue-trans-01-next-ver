import { ConceptPage } from '../../schema';

export const serverState: ConceptPage = {
  slug: 'server-state',
  axis: 'react-vue',
  title: '서버 상태 관리 (TanStack Query ↔ Vue Query / Composable)',
  cardTitle: '서버 상태 관리',
  cardSubtitle: 'TanStack Query (React ↔ Vue)',
  cardSummary: '서버 데이터는 빌려온 복사본, 언제 다시 가져올지가 핵심입니다.',
  oneLineSummary:
    '서버 데이터는 내 컴퓨터의 물건이 아니라 원격 도서관의 책이므로, 언제든 바뀔 수 있는 책의 복사본을 유효기간(staleTime) 동안만 읽고 제때 반납·갱신(재검증)해 주는 전담 사서가 바로 서버 상태 관리 도구입니다.',
  keywords: [
    'TanStack Query',
    'Vue Query',
    'useQuery',
    'useMutation',
    'staleTime',
    'gcTime',
    'invalidateQueries',
    'useInfiniteQuery',
    '낙관적 업데이트',
    'useFetch',
    'useAsyncData',
    'SSOT',
    '캐싱',
  ],
  analogy:
    'Promise는 출처를 묻지 않는 밀봉된 배송 봉투와 같고, TanStack Query는 그 봉투의 내용물이 아니라 겉면의 배송 상태(기다리는 중·성공·실패 상태 기계)를 전문적으로 관리하는 관제 센터입니다.',
  comparisonNote:
    "이름에 '서버'가 붙어 있지만, TanStack Query가 실제로 요구하는 건 결과(또는 에러)를 담은 Promise를 돌려주는 함수뿐입니다. 데이터의 출처가 서버인지는 라이브러리가 따지지 않습니다. '서버 상태'는 기술 제한이 아니라, 내가 주인이 아니고 시간이 지나면 낡을 수 있는 비동기 데이터라는 성격을 부르는 이름입니다.",
  diagramId: 'server-state-diagram',
  comparisonTable: [
    {
      label: '서버 상태 vs 클라이언트 상태',
      common:
        '서버 상태는 비동기적 소유권이 외부에 있는 데이터로 캐싱, 백그라운드 재검증(Refetch), 중복 요청 제거, 에러/로딩 상태 기계 관리가 필수적입니다. 반면 클라이언트 상태(모달 열림, 다크모드, 폼 입력 등)는 프론트엔드 앱이 온전히 소유한 동기적 UI 데이터로 캐싱 만료 개념이 없습니다.',
    },
    {
      label: 'React vs Vue 표준 도구 생태계',
      left: 'React 생태계: 널리 쓰이는 TanStack Query(v5)를 사용하여 `useQuery`, `useMutation`으로 서버 상태를 전담 분리.',
      right:
        'Vue 생태계: 공식 Vue 어댑터인 `@tanstack/vue-query`를 사용. Nuxt 3 환경에서는 내장된 `useFetch` / `useAsyncData`로 서버 데이터를 가져오는 방법도 있음.',
    },
    {
      label: '쿼리 키가 바뀔 때 재조회',
      left: '렌더링 때 queryKey에 넘긴 값이 바뀌면 새 키의 쿼리를 조회합니다.',
      right:
        'queryKey 안의 ref·getter를 자동으로 추적해, 값이 바뀌면 다시 조회합니다. 단, ref에서 .value로 값을 꺼내 넣으면 추적이 끊깁니다.',
    },
    {
      label: '캐시 생명주기 제어 (staleTime vs gcTime)',
      common:
        'staleTime(기본값: 0초)은 캐시 데이터가 "신선한 상태"로 유지되어 재요청 없이 바로 재사용되는 유효기간이며, gcTime(구 cacheTime, 기본값: 5분)은 화면에서 컴포넌트가 언마운트되어 구독자가 0명이 된 후 메모리에서 폐기되기 전까지 보관되는 유예기간입니다.',
    },
    {
      label: '데이터 갱신 트리거 (invalidateQueries)',
      common:
        '모든 데이터를 강제로 즉시 재호출하는 것이 아니라, 해당 캐시를 "오래됨(Stale)"으로 마킹한 뒤 현재 화면에 마운트된 활성 쿼리만 선별 리패치합니다. 화면에 보이지 않는 비활성 쿼리는 나중에 화면에 다시 진입할 때 백그라운드에서 신선한 데이터를 자동으로 동기화합니다.',
    },
    {
      label: '단일 진실 원천(SSOT)과 피해야 할 방식',
      common:
        '비동기 서버 데이터를 Zustand, Redux, Pinia 같은 전역 스토어에 복사해 넣는 방식은 캐시 불일치와 중복 상태가 생기기 쉬워 권장되지 않습니다. 비동기 데이터는 TanStack Query 캐시 자체를 단일 진실 공급원으로 삼고, 전역 스토어에는 순수 UI 제어 플래그만 격리해 두는 것이 좋습니다.',
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
      sourceProject: '아이템 목록 대시보드',
      leftCode: `// [React] 아이템 즐겨찾기 토글 및 낙관적 업데이트 (useItemMutations.ts)
// 즐겨찾기 토글 시 낙관적 업데이트와 실패 시 스냅샷 복원
export function useToggleFavoriteMutation(favorites: Item[], setFavorites: (items: Item[]) => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Item) => toggleFavoriteApi(item.id),
    onMutate: async (item) => {
      // 1. 진행 중인 리패치 취소하여 낙관적 업데이트 덮어쓰기 방지
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      // 2. 롤백을 위한 이전 상태 스냅샷 복사 (불변성 보장)
      const previousFavorites = [...favorites];
      // 3. UI 즉시 낙관적 업데이트
      const exists = favorites.some((b) => b.id === item.id);
      const next = exists ? favorites.filter((b) => b.id !== item.id) : [...favorites, item];
      setFavorites(next);
      return { previousFavorites };
    },
    onError: (_error, _item, context) => {
      // 4. 에러 발생 시 백업 스냅샷으로 즉시 롤백
      if (context?.previousFavorites) {
        setFavorites(context.previousFavorites);
      }
    },
    onSettled: () => {
      // 5. 서버 진실값과 최종 재동기화
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}`,
      rightCode: `// [Vue] Vue 3.4+ Vue Query — useMutation을 통한 동일 로직 이식
import { useMutation, useQueryClient } from '@tanstack/vue-query';

export function useToggleFavoriteMutation(favoriteStore: ReturnType<typeof useFavoriteStore>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Item) => toggleFavoriteApi(item.id),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = [...favoriteStore.favorites];
      favoriteStore.toggle(item);
      return { previousFavorites };
    },
    onError: (_err, _item, context) => {
      if (context?.previousFavorites) {
        favoriteStore.favorites = context.previousFavorites;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}`,
    },
    {
      label: '실전 예제',
      version:
        'React 18+ (TanStack Query useInfiniteQuery) vs Vue 3.4+ (Vue Query useInfiniteQuery)',
      sourceProject: '무한 스크롤 목록 화면',
      leftCode: `// [React] 검색 무한 스크롤 방어 로직 (useSearchInfinite.ts)
// 외부 API의 total_count 부정확성에 대비한 무한 스크롤 이중 종료 방어 조건
export function useSearchInfinite(query: string) {
  return useInfiniteQuery({
    queryKey: ['items', 'search', query],
    queryFn: ({ pageParam = 1 }) => fetchItemsApi(query, pageParam),
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

export function useSearchInfinite(query: Ref<string>) {
  return useInfiniteQuery({
    queryKey: () => ['items', 'search', query.value],
    queryFn: ({ pageParam = 1 }) => fetchItemsApi(query.value, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const fetchedCount = allPages.reduce((sum, p) => sum + p.items.length, 0);
      // 캐싱과 상태 관리는 같은 TanStack 코어를 쓰므로 동일하게 동작 (queryKey의 반응형 처리 등 어댑터 차이는 있음)
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
      sourceProject: '검색 화면',
      leftCode: `// [React] 동일 키워드 재검색 캐시 우회 (SearchSection.tsx)
// 동일 키워드 재검색 시 queryKey 캐시 우회 및 refetch 강제 트리거
export function SearchSection() {
  const searchResultRef = useRef<{ refetch: () => void }>(null);
  const [lastKeyword, setLastKeyword] = useState('');

  const handleSearch = (keyword: string) => {
    if (keyword === lastKeyword) {
      // queryKey가 바뀌지 않으면 렌더링만으로는 재요청하지 않으므로 직접 refetch 호출
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
    // Vue Query도 queryKey가 바뀌지 않으면 재요청하지 않음
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
      sourceProject: '자주 바뀌지 않는 정책·약관 조회 화면',
      leftCode: `// [React] 정책·약관 쿼리 캐시 정책 (policyQueries.ts)
// 변경 주기가 길고 안정적인 정책 데이터의 특성을 고려한 1시간 staleTime 정책
export function usePolicyQuery(keyword: string) {
  return useQuery({
    queryKey: ['policies', keyword],
    queryFn: () => fetchPolicy(keyword),
    enabled: keyword.length > 0,
    staleTime: 1000 * 60 * 60, // 1시간 동안 신선한 데이터로 간주 (캐시 재사용)
    gcTime: 1000 * 60 * 60 * 2,  // 2시간 동안 메모리에 캐시 유지
  });
}`,
      rightCode: `// [Vue] Vue 3.4+ Vue Query — 동일한 도메인 기반 staleTime 적용
import { useQuery } from '@tanstack/vue-query';

export function usePolicyQuery(keyword: Ref<string>) {
  return useQuery({
    queryKey: () => ['policies', keyword.value],
    queryFn: () => fetchPolicy(keyword.value),
    enabled: () => keyword.value.length > 0,
    staleTime: 1000 * 60 * 60, // 1시간 (변경 주기 분석 기반 결정)
    gcTime: 1000 * 60 * 60 * 2,
  });
}`,
    },
  ],
  pitfalls: [
    {
      question:
        'queryFn에는 서버 요청만 넣을 수 있나요? 서버 상태 라이브러리라면서요.',
      answer: {
        lead: '공식 문서 기준으로 queryFn은 Promise를 반환하는 함수이면 되고, 출처는 제한하지 않습니다.',
        listType: 'bullet',
        items: [
          {
            term: '서버 상태의 성격',
            desc: "'서버 상태'는 원격에 있고 시간이 지나면 낡을 수 있는 비동기 데이터라는 성격을 부르는 이름입니다.",
          },
          {
            term: '클라이언트 상태 도구',
            desc: '그런 성격이 없는 값(예: 모달 열림 여부)은 이 도구가 아니라 Zustand나 Pinia 같은 클라이언트 상태 도구가 맞습니다.',
          },
        ],
      },
    },
    {
      question:
        '낙관적 업데이트(Optimistic Update)는 비동기 처리 확정 전인데 성공한 것처럼 보여줘 사용자를 속이는 것 아닌가요? 연속 클릭 시 스냅샷이 꼬이지 않나요?',
      answer: {
        lead: '낙관적 업데이트는 사용자 경험(UX)을 극대화하기 위한 의도된 트레이드오프입니다.',
        listType: 'ordered',
        items: [
          {
            term: '즉각적인 피드백 가치',
            desc: '북마크나 좋아요처럼 실패 확률이 낮고 롤백 비용이 적은 인터랙션에서는 즉각적인 피드백의 가치가 큽니다(단, 금융 결제처럼 실패 비용이 큰 작업에는 낙관적 업데이트 적용을 신중히 판단해야 합니다).',
          },
          {
            term: '연속 클릭 시 스냅샷 문제',
            desc: 'A, B 요청이 빠르게 겹칠 경우 나중에 실패한 롤백이 중간 변경을 덮어쓸 수 있는 실제 취약점이 맞습니다.',
          },
          {
            term: '충돌 방지 고도화',
            desc: '현업이나 복잡한 환경에서는 같은 `scope.id`를 지정해 뮤테이션을 순서대로 실행하거나, 낙관적 상태에 임시 ID/버전 번호를 부여하여 충돌을 방지하는 방향으로 고도화할 수 있습니다.',
          },
        ],
      },
    },
    {
      question:
        '무한 스크롤 getNextPageParam에서 그냥 total_count만 확인하면 되는데 왜 굳이 페이지 아이템 수(< 10)까지 이중으로 체크했나요?',
      answer: {
        lead: '외부 API가 응답하는 `total_count`의 오차로 인한 무한 루프 버그를 방어하기 위해서입니다.',
        listType: 'ordered',
        items: [
          {
            term: 'total_count 오차 위험',
            desc: '실시간 인덱싱 지연이나 권한 필터링 등으로 실제 데이터 개수와 불일치할 수 있어, `total_count`만 맹신하면 다음 페이지를 끊임없이 헛요청할 수 있습니다.',
          },
          {
            term: '1차 검증 (수신 아이템 수)',
            desc: '클라이언트가 직접 수신한 이번 페이지 아이템 개수가 페이지 크기(10개) 미만이면 마지막 페이지로 판별합니다.',
          },
          {
            term: '2차 검증 (total_count 대조)',
            desc: '누적 수신 개수가 API의 total_count 이상이면 종료하도록 이중 방어적 프로그래밍(Defensive Programming)을 적용했습니다.',
          },
        ],
      },
    },
    {
      question:
        '동일 키워드 재검색을 위해 부모가 ref로 자식의 refetch 함수를 직접 호출하는 것은 React의 단방향 데이터 흐름을 깨뜨리는 안티패턴 아닌가요?',
      answer: {
        lead: '데이터를 아래로 전달하는 흐름 관점에서는 일반적인 패턴이 아닙니다.',
        listType: 'ordered',
        items: [
          {
            term: '실용적 탈출구',
            desc: '상태를 전달하는 것이 아니라 일회성 "명령(Imperative Action)"을 트리거하는 것이므로, `useImperativeHandle`과 같은 맥락의 실용적 탈출구로 쓰이기도 합니다.',
          },
          {
            term: '대안 1 (상태 끌어올리기)',
            desc: '검색 쿼리 상태 자체를 부모로 완전히 끌어올려 단방향 흐름을 유지합니다.',
          },
          {
            term: '대안 2 (타임스탬프 쿼리 키)',
            desc: '동일 키워드라도 검색 클릭 시점의 타임스탬프를 쿼리 키에 포함시켜 자연스럽게 재요청을 유도합니다.',
          },
        ],
      },
    },
    {
      question:
        '자주 바뀌지 않는 정책·약관 조회 화면에서 데이터의 staleTime을 1시간으로 설정한 명확한 기술적·상황적 근거는 무엇인가요?',
      answer: {
        lead: 'staleTime 기본값(0초)을 기계적으로 쓰지 않고 데이터의 실제 변경 주기를 분석했기 때문입니다.',
        listType: 'ordered',
        items: [
          {
            term: '긴 변경 주기 특성',
            desc: '정책 기준이나 약관, 공지성 데이터는 주식 시세나 채팅처럼 분·초 단위로 바뀌지 않고 변경 주기가 매우 깁니다.',
          },
          {
            term: '실용적인 타협점',
            desc: '1시간은 불필요한 서버 트래픽을 차단하면서도, 당일 변경된 내용을 적절히 반영할 수 있는 실용적인 타협점입니다.',
          },
          {
            term: '조건부 요청 대안',
            desc: '더 정밀하게 다룬다면 서버 응답의 최종 수정일(Last-Modified) 헤더를 활용한 조건부 요청으로 변경 여부만 확인하는 방법도 있습니다.',
          },
        ],
      },
    },
    {
      question:
        'TanStack Query가 서버 상태 관리용 라이브러리라면, 왜 queryFn에 로컬스토리지나 Mock 함수를 넣어도 정상 동작하나요?',
      answer: {
        lead: 'TanStack Query의 기술적 계약(Interface Contract)은 "HTTP 서버를 호출하는 함수"가 아니라 오직 "Promise를 반환하는 함수"이기 때문입니다.',
        listType: 'ordered',
        items: [
          {
            term: 'Promise 상태 기계',
            desc: 'Promise는 출처를 묻지 않는 포장 봉투와 같아서, 브라우저 스토리지 읽기든 타이머 기반 가짜 데이터든 Promise 형태로만 반환되면 상태 기계(Pending → Success/Error)는 동일하게 동작합니다.',
          },
          {
            term: '핵심 시나리오 표현',
            desc: '"서버 상태"라는 단어는 기술적 제약이 아니라 라이브러리가 효과를 발휘하는 핵심 활용 시나리오를 지칭하는 표현입니다.',
          },
        ],
      },
    },
    {
      question:
        'staleTime과 gcTime(구 cacheTime)의 차이를 설명하고, staleTime의 기본값이 0초인 이유는 무엇인가요?',
      answer: {
        lead: '두 설정은 캐시 데이터의 신선도와 메모리 보관 유예 기간을 서로 다르게 제어합니다.',
        listType: 'bullet',
        items: [
          {
            term: 'staleTime',
            desc: '캐시된 데이터가 여전히 신선하여 원천(서버·비동기 출처)에 재요청하지 않아도 되는 유효기간입니다. 기본값 0초는 캐시 데이터를 즉시 보여주되, 이를 오래된 데이터로 간주해 새 화면이 마운트되는 등의 시점에 백그라운드에서 다시 확인한다는 기본 철학을 반영합니다.',
          },
          {
            term: 'gcTime (구 cacheTime)',
            desc: '화면에서 사용되지 않는(언마운트된) 데이터를 가비지 컬렉터가 메모리에서 지우기 전까지 유지하는 보관 기간입니다.',
          },
        ],
      },
    },
    {
      question:
        'queryClient.invalidateQueries()를 실행하면 캐시된 모든 데이터가 그 즉시 서버로 재호출되나요?',
      answer: {
        lead: '아닙니다. `invalidateQueries`는 즉각적인 네트워크 폭풍을 일으키지 않습니다.',
        listType: 'ordered',
        items: [
          {
            term: '1단계: Stale 마킹',
            desc: '먼저 지정된 쿼리 키의 데이터를 "오래됨(Stale)" 상태로 마킹합니다.',
          },
          {
            term: '2단계: 활성 쿼리 즉시 리패치',
            desc: '오직 "현재 화면에 마운트되어 활발히 사용 중인 쿼리"만 즉시 백그라운드에서 다시 가져옵니다.',
          },
          {
            term: '3단계: 비활성 쿼리 지연 패치',
            desc: '현재 화면에 렌더링되지 않은 비활성(Inactive) 쿼리는 재요청하지 않고 마킹만 남겨두며, 사용자가 나중에 해당 화면으로 다시 진입할 때 비로소 최신 데이터를 패치합니다.',
          },
        ],
      },
    },
    {
      question:
        'API로 받아온 서버 데이터를 Zustand나 Pinia 같은 전역 스토어에 다시 복사해서 저장하는 것은 왜 권장되지 않는 방식인가요?',
      answer: {
        lead: '단일 진실 원천(Single Source of Truth) 원칙이 깨지기 때문입니다.',
        listType: 'bullet',
        items: [
          {
            term: '전역 스토어 복제 시 문제',
            desc: '비동기 서버 데이터를 클라이언트 전역 스토어에 복제하면, TanStack Query가 수행하는 자동 캐시 갱신, 백그라운드 리패칭, 낙관적 업데이트의 결과가 전역 스토어에는 반영되지 않아 화면 간 데이터 불일치가 발생할 수 있습니다.',
          },
          {
            term: '올바른 역할 분리',
            desc: '비동기 데이터는 TanStack Query 캐시 자체를 단일 원천으로 바라보고, Zustand/Pinia에는 모달 상태나 선택된 필터 같은 순수 UI 상태만 보관하는 것이 좋습니다.',
          },
        ],
      },
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
