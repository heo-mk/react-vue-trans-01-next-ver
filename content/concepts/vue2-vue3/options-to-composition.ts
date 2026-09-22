import { ConceptPage } from '../../schema';

export const optionsToComposition: ConceptPage = {
  slug: 'options-to-composition',
  axis: 'vue2-vue3',
  title: 'Options API에서 Composition API (<script setup>)로의 전환',
  oneLineSummary:
    'Options API가 서랍 종류(데이터 칸, 함수 칸, 감시자 칸)별로 코드를 나누어 담았다면, Composition API는 같은 일(기능)을 하는 물건들을 하나의 상자에 한 번에 모아 담는 방식입니다.',
  analogy:
    '요리 레시피를 쓸 때, 이전에는 재료 목록, 조리 도구 목록, 요리 순서를 서류 양식별로 따로 적어두어 왔다 갔다 읽어야 했다면, 새 방식은 "라면 끓이기", "김치 볶기" 단위로 재료와 조리법을 묶어 모듈화한 것입니다.',
  comparisonTable: [
    {
      label: '코드 구성 방식',
      left: '옵션 중심 (data, methods, computed, watch 속성으로 코드 분산)',
      right:
        '논리적 관심사(Feature) 중심. 기능별 변수와 함수를 자유롭게 근접 배치',
    },
    {
      label: 'TypeScript 지원',
      left: 'this 컨텍스트 추론의 한계로 인해 복잡한 타입 정의 및 데코레이터 필요',
      right:
        '순수 함수와 변수 기반이므로 별도 설정 없이 완벽한 타입 추론과 제네릭 지원',
    },
    {
      label: '로직 재사용',
      left: 'Mixins 사용 — 네임스페이스 충돌 위험, 속성 출처가 불분명한 암묵적 주입',
      right:
        'Composables(useXxx) 사용 — 명시적 매개변수와 반환값으로 투명한 재사용',
    },
    {
      label: '인스턴스 this 사용',
      left: '모든 상태와 메서드에 this.count, this.fetchData()로 접근 필수',
      right: 'this가 완전히 제거됨. 클로저(Closure)와 스코프 변수로 직접 접근',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'Vue 2.7+ (Options API) → Vue 3.4+ (<script setup>)',
      leftCode: `<!-- [Vue 2] Options API Counter.vue -->
<template>
  <div>
    <p>카운트: {{ count }} (2배: {{ doubleCount }})</p>
    <button @click="increment">+1 증가</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  data() {
    return {
      count: 0,
    };
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    },
  },
  methods: {
    increment() {
      this.count++;
    },
  },
};
</script>`,
      rightCode: `<!-- [Vue 3] Composition API (<script setup>) Counter.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';

// 관련 상태와 계산된 속성, 메서드를 같은 위치에 선언
const count = ref<number>(0);
const doubleCount = computed(() => count.value * 2);

const increment = () => {
  count.value++;
};
</script>

<template>
  <div>
    <p>카운트: {{ count }} (2배: {{ doubleCount }})</p>
    <button @click="increment">+1 증가</button>
  </div>
</template>`,
    },
    {
      label: '실전 예제',
      version: 'Vue 2.7+ Mixin → Vue 3.4+ Custom Composable',
      sourceProject: 'Portfolio Admin Dashboard',
      leftCode: `// [Vue 2] 페이지네이션 Mixin 패턴 (출처 추적 불가 문제)
// mixins/pagination.js
export default {
  data() {
    return { page: 1, pageSize: 10, total: 0 };
  },
  methods: {
    nextPage() {
      this.page++;
      this.fetchList(); // 컴포넌트에 이 메서드가 있을 거라 암묵적 가정
    },
  },
};

// Component.vue
export default {
  mixins: [paginationMixin, filterMixin], // 두 믹스인에서 같은 변수명을 쓰면 충돌!
  methods: {
    fetchList() { /* ... */ }
  }
};`,
      rightCode: `// [Vue 3] usePagination Composable 패턴 (완전한 타입 안정성과 명시성)
// composables/usePagination.ts
import { ref, readonly } from 'vue';

export function usePagination(onPageChange: (page: number) => void) {
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const nextPage = () => {
    page.value++;
    onPageChange(page.value);
  };

  return {
    page: readonly(page),
    pageSize,
    total,
    nextPage,
  };
}

// Component.vue (<script setup>)
import { usePagination } from '@/composables/usePagination';

const { page, nextPage } = usePagination((next) => {
  fetchItems(next);
});`,
    },
  ],
  diagramId: 'composition-migration-diagram',
  pitfalls: [
    {
      question:
        'Vue3에서 reactive()로 선언한 객체를 const { user, token } = state 로 구조분해하면 왜 반응성이 끊어지나요?',
      answer:
        'reactive()는 JavaScript의 ES6 Proxy로 객체를 감싸 속성 접근과 수정을 트래킹합니다. 객체를 단순 구조 분해 할당하면 Proxy 래퍼와의 연결이 끊긴 순수 원시값이나 일반 객체 참조만 복사되기 때문에 이후 값이 바뀌어도 Vue가 감지할 수 없습니다. 구조분해를 할 때는 반드시 toRefs(state) 또는 toRef()를 거쳐야 각 속성이 ref로 변환되어 반응성이 유지됩니다.',
    },
    {
      question:
        'Vue2의 Options API는 Vue3에서 완전히 폐기(deprecated)되었나요?',
      answer:
        '아닙니다. Vue3에서도 Options API는 100% 공식 지원됩니다. 내부적으로 Options API 또한 동일한 Composition API 반응성 엔진 위에서 동작하도록 재구현되었습니다. 기존 프로젝트를 점진적으로 마이그레이션할 수 있으며, 팀의 선호와 규모에 따라 두 방식을 혼용할 수도 있습니다.',
    },
  ],
  sources: [
    {
      label: 'Vue 3 공식 문서 - Composition API FAQ',
      url: 'https://vuejs.org/guide/extras/composition-api-faq.html',
    },
    {
      label: 'Vue 3 공식 문서 - Script Setup 문법 가이드',
      url: 'https://vuejs.org/api/sfc-script-setup.html',
    },
  ],
};
