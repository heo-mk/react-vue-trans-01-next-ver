import { ConceptPage } from '../../schema';

export const globalState: ConceptPage = {
  slug: 'global-state',
  axis: 'react-vue',
  title: '전역 상태 관리 생태계 (Zustand · Redux · Context API ↔ Pinia · Vuex)',
  cardTitle: '전역 상태 관리',
  cardSubtitle: 'Zustand·Redux ↔ Pinia·Vuex',
  cardSummary: '전역 상태를 Zustand·Redux와 Pinia·Vuex로 비교합니다.',
  oneLineSummary:
    'React는 어디서든 가져다 쓸 수 있는 컴포넌트 밖 비밀 금고(Zustand 클로저)를 열어 필요한 동전만 쏙 꺼내는 방식이고, Vue는 가족 전체가 함께 보고 고치는 거실 화이트보드(Pinia 반응형 스토어) 방식입니다.',
  keywords: [
    'Zustand',
    'Pinia',
    'Redux',
    'Redux Toolkit',
    'RTK',
    'Vuex',
    'Context API',
    'Provide/Inject',
    'storeToRefs',
    'Selector',
    'createSlice',
    'Immer',
    'useSyncExternalStore',
    'persist',
  ],
  analogy: {
    listType: 'bullet',
    items: [
      {
        term: 'Pinia',
        desc: '거실에 걸린 공용 화이트보드와 같아서 누구나 메모를 적거나 지우면 그 방에 있는 가족 모두에게 즉시 보입니다.',
      },
      {
        term: 'Zustand',
        desc: '은행의 개인 금고 시스템과 같아서, 컴포넌트 바깥 독립된 금고(클로저)에 값을 보관하고 각 컴포넌트가 자신이 필요한 통장 내역(Selector)만 선택적으로 확인합니다.',
      },
    ],
  },
  diagramId: 'global-state-diagram',
  comparisonTable: [
    {
      label: 'Zustand ↔ Pinia (현대 표준)',
      left: 'Zustand: 컴포넌트 트리 외부 클로저에 상태 저장. `useSyncExternalStore` 기반 선택적 구독(Selector)으로 필요한 상태 변경 시에만 리렌더링.',
      right:
        'Pinia: Vue 3 반응형 시스템(Proxy) 기반 단일 스토어. Action이 state를 직접 수정하며, 구조분해 시 반응성 유지를 위해 `storeToRefs()` 필요.',
    },
    {
      label: 'Redux (RTK) ↔ Vuex (Flux 레거시)',
      left: 'Redux Toolkit: Action 객체 디스패치 → Reducer를 거치는 엄격한 단방향 흐름. Immer 내장으로 불변성 관리를 추상화하나 보일러플레이트 잔존.',
      right:
        'Vuex: Dispatch(Action) → Commit(Mutation) → State의 복잡한 3단계 파이프라인 강제. Vue 3에서는 Pinia로 공식 대체되어 유지보수 상태.',
    },
    {
      label: 'Context API ↔ Provide/Inject (의존성 주입)',
      left: 'React Context: "상태 주입/전파 도구"이지 상태 관리 라이브러리가 아님. Context 값이 바뀌면 이를 구독하는 하위 트리가 전부 재렌더링됨.',
      right:
        'Vue Provide/Inject: 컴포넌트 계층 간 의존성 주입 도구. 반응형 객체(ref, reactive)를 주입하면 필요한 템플릿 슬롯만 정밀 갱신됨.',
    },
    {
      label: '스토어 위치 및 라이프사이클',
      left: 'React 컴포넌트 트리 외부(모듈 스코프 클로저). 화면의 모든 컴포넌트가 언마운트되어도 메모리에 스토어 상태 유지.',
      right:
        'Vue 인스턴스/앱 컨텍스트에 바인딩. 플랫(Flat)한 독립 스토어 구조이며 어디서든 호출 가능.',
    },
    {
      label: '도구 선택 기준 (언제 무엇을 쓰는가)',
      left: '단순 테마·로케일은 Context API로 충분. 빈번한 UI 업데이트와 미세 렌더링 최적화는 Zustand, 대규모 팀의 엄격한 규약은 Redux Toolkit.',
      right:
        'Vue 3 신규 프로젝트의 클라이언트 전역 상태는 무조건 Pinia가 표준. 단순 부모-자손 깊은 전달만 필요할 때는 Provide/Inject 활용.',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'React 18+ (Zustand 5.x) vs Vue 3.4+ (Pinia 2.x)',
      leftCode: `// [React] Zustand 5.x — 클로저 기반 스토어와 Selector 구독
import { create } from 'zustand';

interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
}

// 1. 스토어 생성 (Provider 래퍼 없이 어디서든 호출 가능)
export const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));

// 2. 컴포넌트에서 필요한 조각(Selector)만 골라서 구독
export function BearCounter() {
  const bears = useBearStore((state) => state.bears); // bears 변경 시에만 리렌더링
  const increase = useBearStore((state) => state.increasePopulation);

  return <button onClick={increase}>Bears: {bears}</button>;
}`,
      rightCode: `<!-- [Vue] Vue 3.4+ (Pinia 2.x) — 반응형 스토어와 직접 액션 호출 -->
<script setup lang="ts">
import { defineStore, storeToRefs } from 'pinia';

// 1. 스토어 정의 (Setup 스토어 또는 Options 스토어 지원)
export const useBearStore = defineStore('bear', {
  state: () => ({ bears: 0 }),
  getters: {
    doubleBears: (state) => state.bears * 2,
  },
  actions: {
    increasePopulation() {
      this.bears++; // mutation 없이 action에서 직접 상태 수정
    },
    removeAllBears() {
      this.bears = 0;
    },
  },
});

// 2. 컴포넌트에서 사용
const store = useBearStore();
// 구조분해 시 반응성을 잃지 않으려면 반드시 storeToRefs 사용!
const { bears, doubleBears } = storeToRefs(store);
const { increasePopulation } = store;
</script>

<template>
  <button @click="increasePopulation">
    Bears: {{ bears }} (Double: {{ doubleBears }})
  </button>
</template>`,
    },
    {
      label: '기초 예제',
      version: 'React 18+ (Redux Toolkit 2.x) vs Vue 2.7+ / Vue 3 (Vuex 4.x 레거시)',
      leftCode: `// [React] Redux Toolkit 2.x — createSlice와 액션 자동 생성
import { createSlice, configureStore, PayloadAction } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Immer 내장: 불변성 보장 복사를 내부에서 자동 처리
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});

export function Counter() {
  const count = useSelector((state: any) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <button onClick={() => dispatch(counterSlice.actions.increment())}>
      Count: {count}
    </button>
  );
}`,
      rightCode: `// [Vue] Vuex 4.x 레거시 — dispatch -> commit -> mutation 파이프라인
import { createStore } from 'vuex';

export const legacyStore = createStore({
  state: () => ({ count: 0 }),
  mutations: {
    // 상태 변경은 오직 동기 mutation 안에서만 가능
    INCREMENT(state) {
      state.count++;
    },
    INCREMENT_BY(state, amount: number) {
      state.count += amount;
    },
  },
  actions: {
    // 비동기 작업 및 mutation 호출은 action 담당
    incrementAsync({ commit }) {
      setTimeout(() => {
        commit('INCREMENT');
      }, 1000);
    },
  },
});

// 컴포넌트 사용: store.dispatch('incrementAsync') 또는 store.commit('INCREMENT')
// (Pinia에서는 이러한 mutation 계층이 완전히 제거되었습니다)`,
    },
    {
      label: '실전 예제',
      version:
        'React 18+ (Zustand 4.x + persist) vs Vue 3.4+ (Pinia 2.x + pinia-plugin-persistedstate)',
      sourceProject: '목록 및 필터 관리 화면',
      leftCode: `// [React] 관심 항목 관리 (favoriteStore.ts)
// 서버 상태와 완전히 분리하여 클라이언트 고유의 '관심 목록'만 Zustand persist로 관리
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  keyword: string;
  category: string;
}

interface FavoriteStore {
  favorites: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (keyword: string) => void;
  isFavorite: (keyword: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      // 중복 방지 및 불변성 유지 새 배열 생성
      addFavorite: (item: FavoriteItem) => {
        set((state) => {
          if (state.favorites.some((fav) => fav.keyword === item.keyword)) {
            return state; // 중복 추가 방지
          }
          return { favorites: [...state.favorites, item] };
        });
      },

      removeFavorite: (keyword: string) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.keyword !== keyword),
        }));
      },

      isFavorite: (keyword: string) => {
        return get().favorites.some((fav) => fav.keyword === keyword);
      },
    }),
    {
      name: 'item-favorites-storage', // localStorage key
    }
  )
);`,
      rightCode: `// [Vue] Vue 3.4+ Pinia + pinia-plugin-persistedstate 동일 구현
import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface FavoriteItem {
  keyword: string;
  category: string;
}

export const useFavoriteStore = defineStore(
  'favorites',
  () => {
    const favorites = ref<FavoriteItem[]>([]);

    function addFavorite(item: FavoriteItem) {
      if (favorites.value.some((fav) => fav.keyword === item.keyword)) {
        return;
      }
      // Vue 반응성: 직접 push 가능
      favorites.value.push(item);
    }

    function removeFavorite(keyword: string) {
      favorites.value = favorites.value.filter((fav) => fav.keyword !== keyword);
    }

    function isFavorite(keyword: string) {
      return favorites.value.some((fav) => fav.keyword === keyword);
    }

    return { favorites, addFavorite, removeFavorite, isFavorite };
  },
  {
    persist: true, // pinia-plugin-persistedstate 플러그인으로 로컬스토리지 자동 연동
  }
);
</script>`,
    },
    {
      label: '실전 예제',
      version: 'React 18+ (Zustand + useMemo) vs Vue 3.4+ (Pinia getters / computed)',
      sourceProject: '입력 단계 및 계산 결과 화면',
      leftCode: `// [React] 입력 단계 및 계산 결과 분리
// 스토어에는 순수 직렬화 가능한 데이터만 저장하고, 파생 계산 로직은 별도 훅(useMemo)으로 분리
// 1. stores/progressStore.ts: JSON.stringify 제약으로 순수 데이터만 보존
export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      currentStep: 1,
      inputValues: { usageMonths: null, planType: 'basic' },
      setStep: (step) => set({ currentStep: step }),
    }),
    { name: 'progress-storage' }
  )
);

// 2. features/calculator/useCalculationResult.ts: 파생 계산 로직은 useMemo 훅에서 전담
export function useCalculationResult() {
  const currentStep = useProgressStore((s) => s.currentStep);
  const inputValues = useProgressStore((s) => s.inputValues);

  return useMemo(() => {
    const results = [];
    if (inputValues.usageMonths !== null && inputValues.usageMonths >= 36) {
      results.push({ id: 'long-term-discount', text: '장기 이용 할인 적용', isHighlight: true });
    }
    if (inputValues.planType === 'premium') {
      results.push({ id: 'premium-benefit', text: '우대 혜택 포함', isHighlight: true });
    }
    return results;
  }, [currentStep, inputValues]); // 의존성 배열 명시 필요
}`,
      rightCode: `// [Vue] Vue 3.4+ Pinia — getter와 computed를 활용한 자연스러운 파생 상태 분리
import { defineStore } from 'pinia';
import { computed } from 'vue';

export const useProgressStore = defineStore('progress', {
  state: () => ({
    currentStep: 1,
    inputValues: { usageMonths: null as number | null, planType: 'basic' },
  }),
  getters: {
    // Pinia의 getter는 함수가 아니라 '계산된 값'으로 취급되므로 직렬화 대상 밖에 위치
    // Vue의 computed처럼 의존하는 상태(usageMonths, planType)를 자동 추적!
    calculationResults(state) {
      const results = [];
      if (state.inputValues.usageMonths !== null && state.inputValues.usageMonths >= 36) {
        results.push({ id: 'long-term-discount', text: '장기 이용 할인 적용', isHighlight: true });
      }
      if (state.inputValues.planType === 'premium') {
        results.push({ id: 'premium-benefit', text: '우대 혜택 포함', isHighlight: true });
      }
      return results;
    },
  },
  persist: true, // pinia-plugin-persistedstate는 state만 저장하고 getter는 자동 배제
});`,
    },
  ],
  pitfalls: [
    {
      question:
        'Context API가 있는데 왜 굳이 Zustand나 Redux 같은 전역 상태 라이브러리를 추가로 도입하나요?',
      answer: {
        lead: 'Context API는 "상태 관리 도구"가 아니라 단순한 "의존성 주입(Prop Drilling 해결) 전파 메커니즘"입니다.',
        listType: 'bullet',
        items: [
          {
            term: 'Context API 한계',
            desc: 'Context의 Provider value가 변경되면 이를 구독하는 하위의 모든 컴포넌트가 불필요하게 리렌더링될 수 있다는 한계가 있습니다.',
          },
          {
            term: 'Zustand 장점',
            desc: '컴포넌트 트리 외부의 클로저에 상태를 두고, Selector를 통해 실제로 사용하는 속성이 변경되었을 때만 정밀하게 리렌더링하므로 고빈도 UI 업데이트에서도 렌더링 낭비가 전혀 없습니다.',
          },
        ],
      },
    },
    {
      question:
        '목록·필터·차트가 함께 있는 대시보드처럼 서버 데이터와 화면 상태가 섞인 화면에서, 왜 Context API 하나로 끝내지 않고 Zustand와 React Query를 둘 다 쓰나요? 과설계 아닌가요?',
      answer: {
        lead: 'Context API에 서버 데이터와 화면 상태를 한꺼번에 담으면 성능 문제가 생길 수 있습니다.',
        listType: 'ordered',
        items: [
          {
            term: '불필요한 렌더링 방지',
            desc: '필터 버튼 하나를 눌렀을 뿐인데 무거운 차트까지 통째로 다시 그려지는 문제를 막고, 세밀한 구독 단위로 실제로 값이 바뀐 컴포넌트만 다시 그립니다.',
          },
          {
            term: '유지보수와 관심사 분리',
            desc: '규모가 작은 앱에서는 useState만으로도 충분하지만, 서비스가 커질수록 "서버에서 가져온 데이터"와 "화면 안에서만 쓰는 상태"를 나눠 두는 편이 불필요한 렌더링을 줄이고 유지보수하기 쉽습니다.',
          },
        ],
      },
    },
    {
      question:
        '입력값에 따라 결과가 계산되어 나오는 화면(진단, 계산기, 추천 등)에서, 계산 결과를 스토어에 저장하지 않고 useMemo 기반 훅으로 분리하는 이유는 무엇인가요?',
      answer: {
        lead: '스토어에는 원본 데이터만 두고, 계산 결과는 useMemo 기반 훅에서 그때그때 만드는 것이 안전합니다. 이유는 세 가지입니다.',
        listType: 'ordered',
        items: [
          {
            term: '동기화 부담',
            desc: '계산된 결과값을 스토어에 따로 저장하면 원본이 바뀔 때마다 결과도 함께 갱신해야 합니다.',
          },
          {
            term: '낡은 결과 버그',
            desc: '갱신을 빠뜨리면 원본과 다른 낡은 결과가 화면에 표시됩니다.',
          },
          {
            term: 'persist 문제',
            desc: 'persist 미들웨어로 저장하면 낡은 계산 결과까지 저장돼서, 계산 규칙이 바뀐 뒤에도 옛 결과가 남을 수 있습니다.',
          },
        ],
        closing: 'Vue의 Pinia라면 getter가 이 역할을 기본 문법으로 해결합니다.',
      },
    },
    {
      question:
        'Zustand 스토어의 데이터는 React 컴포넌트 안에 저장되나요? 컴포넌트가 언마운트되면 상태가 사라지나요?',
      answer: {
        lead: '아닙니다. Zustand의 상태는 컴포넌트 트리 내부가 아닌 자바스크립트 모듈 스코프의 클로저(Closure) 변수에 저장됩니다.',
        listType: 'ordered',
        items: [
          {
            term: '메모리 안전 유지',
            desc: '특정 화면의 컴포넌트가 전부 언마운트되어 사라져도 스토어의 값은 메모리에 안전하게 유지됩니다.',
          },
          {
            term: '상태 찢어짐(Tearing) 방지',
            desc: 'React 18의 동시성 렌더링 환경에서 발생할 수 있는 상태 찢어짐 현상은 React의 공식 프리미티브인 `useSyncExternalStore`를 통해 완벽히 방지됩니다.',
          },
        ],
      },
    },
    {
      question:
        'Pinia 스토어에서 상태값을 구조분해 할당(`const { count } = useStore()`)하면 왜 반응성이 깨지나요?',
      answer: {
        lead: 'Pinia의 상태는 내부적으로 Vue 3의 `reactive` Proxy 객체로 감싸져 있습니다.',
        listType: 'ordered',
        items: [
          {
            term: '반응성 소실 원인',
            desc: 'ES6 객체 구조분해 할당을 수행하면 Proxy 통로를 거치지 않고 원시 원형 값(Primitive Value)만 복사되므로, 값이 변경되어도 화면이 갱신되지 않는 반응성 소실이 발생합니다.',
          },
          {
            term: 'storeToRefs 해결책',
            desc: '이를 방지하려면 Pinia가 공식 제공하는 `storeToRefs(store)` 헬퍼 함수를 사용하여 각 속성을 `ref` 포장 상자로 감싸서 추출해야 합니다.',
          },
        ],
      },
    },
    {
      question:
        'Zustand를 TypeScript와 함께 쓸 때 `create<T>()((set) => ...)` 처럼 소괄호를 두 번 쓰는 커링 문법을 쓰는 이유는 무엇인가요?',
      answer: {
        lead: 'TypeScript 컴파일러가 상태 인터페이스 `T`를 스스로 추론하지 못하는 한계 때문입니다.',
        listType: 'ordered',
        items: [
          {
            term: '자동 추론 불가 원인',
            desc: 'Zustand의 스토어 생성 함수는 상태 타입 `T`를 반환하는 동시에 매개변수의 콜백 반환값으로도 전달받기 때문에, 타입 인자가 들어오는 자리와 나가는 자리에 동시에 존재하여 자동 추론이 불가능합니다.',
          },
          {
            term: '커링(Currying) 패턴',
            desc: '첫 번째 소괄호 `create<T>()`로 상태 타입을 먼저 고정하고, 두 번째 소괄호에 구현체를 넘겨주는 커링 패턴으로 이 한계를 우회합니다.',
          },
        ],
      },
    },
    {
      question:
        'Redux Toolkit(RTK)의 리듀서 안에서는 `state.value += 1`처럼 직접 상태를 수정해도 정말 괜찮나요?',
      answer: {
        lead: '네, 완벽히 안전합니다.',
        listType: 'ordered',
        items: [
          {
            term: 'Immer 라이브러리 내장',
            desc: 'Redux Toolkit의 `createSlice` 내부에는 불변성 관리 라이브러리인 Immer가 기본 내장되어 있습니다.',
          },
          {
            term: '불변 복사본 자동 생성',
            desc: '개발자가 가변(Mutating) 코드처럼 작성하더라도, Immer의 Proxy 트랩이 변경 사항을 추적하여 내부적으로는 완벽하게 불변성이 보장된 새로운 불변 상태 복사본을 생성해 반환합니다.',
          },
        ],
      },
    },
  ],
  sources: [
    {
      label: 'PkgPulse: React State Management 2026 가이드',
      url: 'https://pkgpulse.com',
    },
    {
      label: 'Pinia 공식 문서 — Introduction & Migration from Vuex',
      url: 'https://pinia.vuejs.org',
    },
    {
      label: 'Redux Toolkit 공식 가이드 — Writing Reducers with Immer',
      url: 'https://redux-toolkit.js.org',
    },
  ],
};
