import { ConceptPage } from '@repo/content/schema';

export const reactivityState: ConceptPage = {
  slug: 'reactivity-state',
  axis: 'react-vue',
  title: '사고 전환의 출발점: 감시(Vue)와 알림(React)',
  cardTitle: '사고 전환의 출발점',
  cardSubtitle: '감시(Vue) ↔ 알림(React)',
  cardSummary: 'Vue는 자동으로 감지하고, React는 setter로 알려줍니다.',
  oneLineSummary:
    'Vue는 값에 센서(Proxy)를 달아 스스로 지켜보다가 바뀌면 알아서 고치고, React는 개발자가 초인종(setter)을 눌러줄 때까지 집주인이 가만히 기다리는 방식입니다.',
  keywords: [
    'useState',
    'ref',
    'Proxy',
    'watchEffect',
    'useEffect',
    'setter',
    '반응성',
    '불변성',
    '가상 DOM',
    'React.memo',
  ],
  analogy: {
    listType: 'bullet',
    items: [
      {
        term: 'Vue',
        desc: 'CCTV가 방 안을 계속 지켜보다가 무언가 움직이면 자동으로 반응하는 것과 같습니다.',
      },
      {
        term: 'React',
        desc: '누군가 초인종을 눌러야만 손님이 왔다는 사실을 아는 집주인과 같습니다.',
      },
    ],
  },
  comparisonTable: [
    {
      label: '근본 철학',
      left: '알림(Notification) 방식 — 개발자가 setter 함수로 명시적 통보',
      right: '감시(Observation) 방식 — Vue가 값의 변화를 스스로 감지',
    },
    {
      label: '반응성 메커니즘',
      left: {
        items: [
          '불변성(Immutability) 기반.',
          '상태 변경 시 컴포넌트 함수 전체를 재실행하여 가상 DOM Diffing 수행',
        ],
      },
      right: {
        items: [
          '가변성(Mutability) 기반.',
          'Proxy(reactive)와 getter/setter(ref)로 변경을 추적하고, 컴파일 단계에서 표시한 변경 가능 부분 위주로 갱신',
        ],
      },
    },
    {
      label: '값 접근 및 수정',
      left: 'getter/setter 분리 (`const [count, setCount] = useState(0)`)',
      right: {
        items: [
          '단일 ref 래퍼 (`const count = ref(0)`).',
          '스크립트에서는 `.value`, 템플릿에서는 최상위 ref가 자동 언래핑',
        ],
      },
    },
    {
      label: '자식 컴포넌트 갱신',
      left: '부모가 리렌더링되면 props 변경 여부와 무관하게 모든 자식이 기본적으로 함께 다시 그려짐 (건너뛰려면 React.memo를 쓰고, React Compiler가 자동으로 처리해주기도 함)',
      right: 'props가 실제로 바뀐 자식 컴포넌트만 갱신됨',
    },
    {
      label: '객체/배열 조작',
      left: '항상 새로운 참조 객체를 복사해서 반환해야 함 (`setList([...list, newItem])`)',
      right: '기존 배열/객체에 직접 push나 속성 할당 허용 (`list.value.push(newItem)`)',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'React 18+ vs Vue 3.4+',
      leftCode: `// [React] React 18+ — 알림(setter) 방식
import { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  // 감시 대상을 개발자가 의존성 배열에 직접 명시해야 함
  useEffect(() => {
    document.title = \`클릭: \${count}\`;
  }, [count]);

  return (
    <button onClick={() => setCount((prev) => prev + 1)}>
      {count}
    </button>
  );
}`,
      rightCode: `<!-- [Vue] Vue 3.4+ — 감시(Proxy) 방식 -->
<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const count = ref(0);

// ref가 읽힌 count.value를 자동으로 추적하여 실행
watchEffect(() => {
  document.title = \`클릭: \${count.value}\`;
});
</script>

<template>
  <button @click="count++">
    {{ count }}
  </button>
</template>`,
      highlights: [
        { side: 'left', id: 1, match: 'const [count, setCount] = useState(0);' },
        { side: 'left', id: 2, match: '}, [count]);' },
        { side: 'left', id: 3, match: 'setCount((prev) => prev + 1)' },
        { side: 'right', id: 1, match: 'const count = ref(0);' },
        { side: 'right', id: 2, match: 'watchEffect(() => {' },
        { side: 'right', id: 3, match: '<button @click="count++">' },
      ],
      keyPoints: [
        {
          id: 1,
          title: '상태 선언',
          left: '값(count)과 setter(setCount)가 한 쌍으로 분리',
          right: 'ref(0) 하나로 값을 선언',
        },
        {
          id: 2,
          title: '부수효과 감시',
          left: 'useEffect 의존성 배열에 [count] 수동 전달',
          right: 'watchEffect 안에서 읽은 count를 자동 추적',
        },
        {
          id: 3,
          title: '값 갱신',
          left: 'setCount((prev) => prev + 1) 호출',
          right: '@click="count++" 직접 증가',
        },
      ],
    },
    {
      label: '실전 예제',
      version: 'React 18+ (TanStack Query + Zustand) vs Vue 3.4+ (Pinia)',
      sourceProject: '아이템 목록 대시보드',
      leftCode: `// [React] 불변성을 활용한 낙관적 업데이트(Optimistic Update) & 스냅샷 롤백
// hooks/useItemMutations.ts
export function useToggleItemMutation() {
  const items = useItemStore((s) => s.items);
  const toggleItem = useItemStore((s) => s.toggleItem);
  const setItems = useItemStore((s) => s.setItems);

  return useMutation({
    mutationFn: (item: Item) => api.toggleItem(item.id),
    onMutate: async (item) => {
      // 이전 상태 스냅샷 복사 (불변성 보장)
      const previousItems = [...items];
      // 낙관적 UI 즉각 업데이트
      toggleItem(item);
      return { previousItems };
    },
    onError: (_error, _item, context) => {
      // 에러 발생 시 백업 스냅샷으로 롤백
      if (context) {
        setItems(context.previousItems);
      }
    },
  });
}`,
      rightCode: `// [Vue] 동일 로직의 Vue/Pinia 구현 패턴
// stores/useItemStore.ts
export const useItemStore = defineStore('item', () => {
  const items = ref<Item[]>([]);

  const toggleWithRollback = async (item: Item) => {
    // 롤백을 위해 현재 상태 스냅샷 저장
    const rollback = [...items.value];
    // 프록시 배열 직접 조작 (복사 없이도 반응)
    const idx = items.value.findIndex((b) => b.id === item.id);
    if (idx >= 0) items.value.splice(idx, 1);
    else items.value.push(item);

    try {
      await api.toggleItem(item.id);
    } catch (err) {
      // 에러 발생 시 이전 스냅샷 복원
      items.value = rollback;
    }
  };
  return { items, toggleWithRollback };
});`,
      highlights: [
        { side: 'left', id: 1, match: 'const previousItems = [...items];' },
        { side: 'left', id: 2, match: 'toggleItem(item);' },
        { side: 'left', id: 3, match: 'setItems(context.previousItems);' },
        { side: 'right', id: 1, match: 'const rollback = [...items.value];' },
        { side: 'right', id: 2, match: 'else items.value.push(item);' },
        { side: 'right', id: 3, match: 'items.value = rollback;' },
      ],
      keyPoints: [
        {
          id: 1,
          title: '스냅샷 저장',
          left: 'onMutate에서 [...items] 배열 복사 후 반환',
          right: 'toggleWithRollback에서 [...items.value] 저장',
        },
        {
          id: 2,
          title: '화면 선반영',
          left: 'toggleItem(item) 별도 함수 호출',
          right: 'items.value.splice 또는 push로 직접 조작',
        },
        {
          id: 3,
          title: '롤백 복원',
          left: 'onError 콜백에서 context.previousItems로 복원',
          right: 'catch 블록에서 items.value = rollback 복원',
        },
      ],
    },
  ],
  diagramId: 'reactivity-diagram',
  pitfalls: [
    {
      question:
        'React의 useState는 왜 Vue의 data()처럼 자동으로 반응하지 않나요? React가 기술적으로 뒤떨어진 건가요?',
      answer: {
        lead: '기술 수준의 문제가 아니라 설계 철학의 문제입니다.',
        listType: 'bullet',
        items: [
          {
            term: 'Vue',
            desc: 'Proxy로 자동 추적하는 대신, 어떤 값이 어디서 쓰이는지 내부적으로 계속 계산하고 추적하는 런타임 비용을 집니다.',
          },
          {
            term: 'React',
            desc: '그 비용 대신, 상태 변경 시점을 개발자가 명시하게 하여 데이터 흐름과 렌더링 시점을 예측하기 쉽게 만드는 쪽을 택했습니다.',
          },
        ],
        closing: '두 방식 모두 정당한 트레이드오프이며 우열의 문제가 아닙니다.',
      },
    },
    {
      question:
        'React에서 컴포넌트가 다시 그려지는(Re-rendering) 경우는 언제 발생하나요?',
      answer: {
        lead: '크게 세 가지입니다.',
        listType: 'ordered',
        items: [
          {
            term: '상태 변경',
            desc: 'useState의 setter 함수가 호출되어 상태가 변경될 때 발생합니다.',
          },
          {
            term: '부모 리렌더링',
            desc: '부모 컴포넌트가 리렌더링될 때 발생합니다 (자식은 props가 안 바뀌어도 기본적으로 함께 다시 그려집니다. React.memo로 건너뛸 수 있고, React Compiler가 자동으로 처리해주기도 합니다).',
          },
          {
            term: 'Context 구독',
            desc: '읽고 있는 Context 값이 바뀔 때 발생합니다.',
          },
        ],
      },
    },
    {
      question:
        'Vue에서 ref로 선언한 상태를 count = count + 1 처럼 직접 재할당하면 왜 반응성이 끊어지나요?',
      answer: {
        lead: 'ref()는 값을 { value: T } 형태의 ref 객체로 감싸서 반환합니다.',
        listType: 'ordered',
        items: [
          {
            term: '추적 체계 이탈',
            desc: 'count에 직접 값을 재할당하면 ref 객체 자체가 일반 숫자로 덮어씌워져 Vue의 반응성 추적에서 벗어납니다.',
          },
          {
            term: '정상 동작 방법',
            desc: '스크립트에서는 반드시 count.value로 내부 프로퍼티를 조작해야 반응성 트래킹이 정상 동작합니다.',
          },
        ],
      },
    },
  ],
  sources: [
    {
      label: "React 공식 문서 - State: A Component's Memory",
      url: 'https://react.dev/learn/state-a-components-memory',
    },
    {
      label: 'Vue 3 공식 문서 - Reactivity Fundamentals',
      url: 'https://vuejs.org/guide/essentials/reactivity-fundamentals.html',
    },
  ],
};
