import { ConceptPage } from '@repo/content/schema';

export const optionsToComposition: ConceptPage = {
  slug: 'options-to-composition',
  axis: 'vue2-vue3',
  title: 'Options API에서 Composition API (<script setup>)로의 전환',
  cardTitle: 'Options → Composition API',
  cardSubtitle: 'Options API·Mixin → <script setup>',
  cardSummary: 'Vue 2는 속성별 감시, Vue 3는 Proxy로 전체를 감시합니다.',
  oneLineSummary:
    'Vue2가 방마다 개별 CCTV(defineProperty)를 달아 새 방을 보지 못했다면, Vue3는 건물 입구에 경비원(Proxy)을 세워 모든 출입을 감시하며, 기능별로 코드를 한곳에 모읍니다.',
  keywords: [
    'Options API',
    'Composition API',
    '<script setup>',
    'Object.defineProperty',
    'Proxy',
    '$set',
    'Mixins',
    'Composables',
    'reactive',
    'ref',
    'toRefs',
  ],
  analogy: {
    listType: 'bullet',
    items: [
      {
        term: 'Vue 2',
        desc: '집사가 미리 정해진 방에만 CCTV를 달아두어 나중에 새로 생긴 방(새 속성)은 보지 못해 $set이 필요했던 방식입니다.',
      },
      {
        term: 'Vue 3',
        desc: '건물 전체 출입구에 경비원(Proxy)을 세워 어떤 방이든 나중에 생겨도 전부 감지하는 방식입니다.',
      },
    ],
  },
  comparisonTable: [
    {
      label: '반응성 엔진',
      left: 'Object.defineProperty — 속성별 개별 감시 (새 속성 추가/배열 인덱스 수정 감지 불가, $set 필수)',
      right:
        'ES6 Proxy — 객체 전체 래핑 감시 (새 속성 추가, 삭제, 배열 조작 모두 자동 감지, $set 완전 제거)',
    },
    {
      label: '코드 구조',
      left: '옵션 중심 (data, methods, computed, watch 속성별로 기능 코드가 파편화)',
      right:
        '논리적 관심사(Feature) 중심 — 같은 기능을 수행하는 상태와 로직을 한 블록에 근접 배치',
    },
    {
      label: '로직 재사용',
      left: 'Mixins 사용 — 변수명 충돌 위험, 속성 출처가 불분명한 암묵적 주입 문제',
      right:
        'Composables (useXxx) 사용 — 매개변수와 반환값이 명시적인 함수 조합 패턴',
    },
    {
      label: 'TypeScript 지원',
      left: 'this 컨텍스트 기반이라 타입 추론이 어렵고, 복잡한 타입 처리가 필요',
      right:
        '순수 변수와 함수 스코프이므로 별도 설정 없이 타입 추론과 자동완성을 그대로 사용',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'Vue 2.7+ (Options API) → Vue 3.4+ (<script setup>)',
      leftCode: `<!-- [Vue 2] Options API: $set 필수 및 옵션 분산 -->
<template>
  <div>
    <p>{{ user.name }} (나이: {{ user.age }})</p>
    <button @click="addAgeProperty">새 속성 추가</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      user: { name: '철수' } // age 속성이 선언 시점에 없음
    };
  },
  methods: {
    addAgeProperty() {
      // Vue2에서는 직접 대입(this.user.age = 20)하면 화면 갱신 안 됨!
      this.$set(this.user, 'age', 20);
    }
  }
};
</script>`,
      rightCode: `<!-- [Vue 3] Composition API (<script setup>): Proxy 자동 감지 -->
<script setup lang="ts">
import { reactive } from 'vue';

interface User {
  name: string;
  age?: number;
}

const user: User = reactive({ name: '철수' });

const addAgeProperty = () => {
  // Vue3 Proxy는 새로운 속성 추가도 즉각 감지 ($set 불필요)
  user.age = 20;
};
</script>

<template>
  <div>
    <p>{{ user.name }} (나이: {{ user.age }})</p>
    <button @click="addAgeProperty">새 속성 추가</button>
  </div>
</template>`,
      highlights: [
        { side: 'left', id: 1, match: "this.$set(this.user, 'age', 20);" },
        { side: 'left', id: 2, match: 'age 속성이 선언 시점에 없음' },
        { side: 'right', id: 1, match: 'user.age = 20;' },
        { side: 'right', id: 2, match: "({ name: '철수' });" },
      ],
      keyPoints: [
        {
          id: 1,
          title: '새 속성 추가',
          left: 'this.$set(...)을 써야 화면이 갱신됨',
          right: 'user.age = 20처럼 직접 대입해도 감지됨',
        },
        {
          id: 2,
          title: '감시 방식',
          left: '선언 시점에 있는 속성만 감시',
          right: 'reactive()가 객체를 Proxy로 감싸서 감시',
        },
      ],
    },
    {
      label: '실전 예제',
      version: 'Vue 2.7+ Mixin 패턴 → Vue 3.4+ Composable 패턴',
      sourceProject: '테이블 페이징 & 필터 목록 화면',
      leftCode: `// [Vue 2] Mixin의 주요 단점: 암묵적 의존성과 이름 충돌
// mixins/tablePagination.js
export default {
  data() {
    return { page: 1, limit: 10, total: 0 };
  },
  methods: {
    nextPage() {
      this.page++;
      this.fetchData(); // 컴포넌트에 fetchData가 있을 것이라 암묵적 가정
    }
  }
};

// Component.vue
export default {
  mixins: [tablePagination, userFilterMixin], // 두 믹스인에 동일한 변수명이 있다면 덮어씌워짐!
  methods: {
    fetchData() { /* ... */ }
  }
};`,
      rightCode: `// [Vue 3] Composable: 명시적 매개변수와 반환값 보장
// composables/useTablePagination.ts
import { ref, readonly } from 'vue';

export function useTablePagination(onFetch: (page: number) => void) {
  const page = ref(1);
  const limit = ref(10);
  const total = ref(0);

  const nextPage = () => {
    page.value++;
    onFetch(page.value);
  };

  return { page: readonly(page), limit, total, nextPage };
}

// Component.vue (<script setup>)
import { useTablePagination } from '@/composables/useTablePagination';

const { page, nextPage } = useTablePagination((newPage) => {
  loadData(newPage);
});`,
      highlights: [
        { side: 'left', id: 1, match: 'this.fetchData();' },
        { side: 'left', id: 2, match: 'mixins: [tablePagination, userFilterMixin],' },
        { side: 'right', id: 1, match: 'useTablePagination(onFetch' },
        { side: 'right', id: 2, match: 'const { page, nextPage } = useTablePagination' },
      ],
      keyPoints: [
        {
          id: 1,
          title: '필요한 의존성',
          left: '컴포넌트에 fetchData가 있을 것이라 암묵적으로 가정',
          right: 'onFetch를 인자로 받아 의존성이 겉으로 드러남',
        },
        {
          id: 2,
          title: '이름 충돌',
          left: '두 믹스인에 같은 변수명이 있으면 덮어씌워짐',
          right: '반환값을 구조분해로 직접 받아 출처가 보임',
        },
      ],
    },
  ],
  diagramId: 'composition-migration-diagram',
  pitfalls: [
    {
      question:
        'Vue2에서는 왜 객체에 새 속성을 추가하거나 배열 인덱스로 값을 바꿀 때 화면이 갱신되지 않았나요?',
      answer: {
        lead: 'Vue2의 반응성 엔진인 `Object.defineProperty()`의 동작 방식 때문입니다.',
        listType: 'ordered',
        items: [
          {
            term: '초기 속성만 감시',
            desc: '컴포넌트 초기화 시점에 이미 존재하는 속성들에 대해서만 getter/setter를 구성하므로, 초기화 이후 추가된 새 속성이나 배열 인덱스(arr[0] = val)는 감시자가 달리지 않아 변경을 감지하지 못했습니다.',
          },
          {
            term: 'Vue2 특수 API ($set)',
            desc: '이 한계를 극복하기 위해 Vue.set()이나 this.$set()이라는 특수 API를 강제해야 했습니다.',
          },
          {
            term: 'Vue3 Proxy 도입',
            desc: 'Vue3는 객체 자체를 감싸는 Proxy를 도입하여 새 속성 추가 같은 감지 한계를 해소했습니다.',
          },
        ],
      },
    },
    {
      question:
        'Vue3에서 reactive()로 감싼 객체를 const { count } = state 로 구조분해하면 반응성이 끊어지는 이유는 무엇인가요?',
      answer: {
        lead: 'reactive()는 JavaScript의 Proxy 객체를 반환하기 때문입니다.',
        listType: 'ordered',
        items: [
          {
            term: 'Proxy 통로 단절',
            desc: '구조분해 할당으로 원시값(Primitive Value) 속성을 꺼내면 Proxy 래퍼와의 연결이 끊어지고 값만 별도 변수로 복사됩니다.',
          },
          {
            term: '트래킹 이탈',
            desc: '복사된 변수는 더 이상 Proxy의 get/set 트래킹을 거치지 않으므로 값이 바뀌어도 화면이 갱신되지 않습니다.',
          },
          {
            term: 'toRefs 유틸리티 해결책',
            desc: '반응성을 유지하면서 구조분해를 하려면 toRefs(state) 유틸리티를 사용하면 됩니다.',
          },
        ],
      },
    },
  ],
  sources: [
    {
      label: 'Vue 3 공식 문서 - Reactivity in Depth',
      url: 'https://vuejs.org/guide/extras/reactivity-in-depth.html',
    },
    {
      label: 'Vue 3 공식 문서 - Composition API FAQ',
      url: 'https://vuejs.org/guide/extras/composition-api-faq.html',
    },
  ],
};
