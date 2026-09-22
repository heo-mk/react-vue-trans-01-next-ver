import { ConceptPage } from '../../schema';

export const reactivityState: ConceptPage = {
  slug: 'reactivity-state',
  axis: 'react-vue',
  title: '사고 전환의 출발점: 감시(Vue)와 알림(React)',
  oneLineSummary:
    'Vue는 값에 센서(Proxy)를 달아 스스로 지켜보다가 바뀌면 알아서 고치고, React는 개발자가 초인종(setter)을 눌러줄 때까지 집주인이 가만히 기다리는 방식입니다.',
  analogy:
    'Vue는 CCTV가 방 안을 계속 지켜보다가 무언가 움직이면 자동으로 반응하는 것과 같고, React는 누군가 초인종을 눌러야만 손님이 왔다는 사실을 아는 집주인과 같습니다.',
  sourceNote: '01_통합보고서 1-1 "감시와 알림이라는 비유" 인용',
  comparisonTable: [
    {
      label: '근본 철학',
      left: '알림(Notification) 방식 — 개발자가 setter 함수로 명시적 통보',
      right: '감시(Observation) 방식 — Proxy가 값의 변화를 스스로 감지',
    },
    {
      label: '반응성 메커니즘',
      left: '불변성(Immutability) 기반. 상태 변경 시 컴포넌트 함수 전체를 재실행하여 가상 DOM Diffing 수행',
      right:
        '가변성(Mutability) 기반. Getter/Setter 트래킹을 통해 변경된 DOM 노드만 정밀 타겟팅 갱신',
    },
    {
      label: '값 접근 및 수정',
      left: 'getter/setter 분리 (`const [count, setCount] = useState(0)`)',
      right:
        '단일 ref 래퍼 (`const count = ref(0)`). 스크립트에서는 `.value`, 템플릿에서는 자동 언래핑',
    },
    {
      label: '자식 컴포넌트 갱신',
      left: '부모가 리렌더링되면 props 변경 여부와 무관하게 모든 자식이 기본적으로 함께 다시 그려짐 (React.memo 필요)',
      right:
        '실제로 변경된 props를 전달받은 자식 컴포넌트만 정밀하게 갱신됨 (컴파일러 최적화)',
    },
    {
      label: '객체/배열 조작',
      left: '항상 새로운 참조 객체를 복사해서 반환해야 함 (`setList([...list, newItem])`)',
      right:
        '기존 배열/객체에 직접 push나 속성 할당 허용 (`list.value.push(newItem)`)',
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

// Proxy가 참조된 count.value를 자동으로 감시하여 실행
watchEffect(() => {
  document.title = \`클릭: \${count.value}\`;
});
</script>

<template>
  <button @click="count++">
    {{ count }}
  </button>
</template>`,
    },
    {
      label: '실전 예제',
      version: 'React 18+ (TanStack Query + Zustand) vs Vue 3.4+ (Pinia)',
      sourceProject: 'smartstore-item-finder & GitFind Dashboard',
      leftCode: `// [React] 포트폴리오 실전: 불변성을 활용한 Optimistic Update & 스냅샷 롤백
// GitFind Dashboard / src/hooks/useRepoMutations.ts
onMutate: async (repo) => {
  // 이전 상태 스냅샷 복사 (불변성 보장)
  const previousBookmarks = [...bookmarks];
  // 낙관적 UI 즉각 업데이트
  toggleBookmark(repo);
  return { previousBookmarks };
},
onError: (_error, _repo, context) => {
  // 에러 발생 시 백업 스냅샷으로 롤백
  if (context) {
    setBookmarks(context.previousBookmarks);
  }
};`,
      rightCode: `// [Vue] 동일 로직의 Vue/Pinia 구현 패턴
// stores/useRepoStore.ts
export const useRepoStore = defineStore('repo', () => {
  const bookmarks = ref<Repo[]>([]);

  const toggleWithRollback = async (repo: Repo) => {
    // 롤백을 위해 현재 상태 스냅샷 저장
    const rollback = [...bookmarks.value];
    // 프록시 배열 직접 조작 (즉시 반응)
    const idx = bookmarks.value.findIndex((b) => b.id === repo.id);
    if (idx >= 0) bookmarks.value.splice(idx, 1);
    else bookmarks.value.push(repo);

    try {
      await api.toggleBookmark(repo.id);
    } catch (err) {
      // 에러 발생 시 이전 스냅샷 복원
      bookmarks.value = rollback;
    }
  };
  return { bookmarks, toggleWithRollback };
});`,
    },
  ],
  diagramId: 'reactivity-diagram',
  pitfalls: [
    {
      question:
        'React의 useState는 왜 Vue의 data()처럼 자동으로 반응하지 않나요? React가 기술적으로 뒤떨어진 건가요?',
      answer:
        '기술 수준의 문제가 아니라 설계 철학의 문제입니다. Vue는 Proxy로 자동 추적하는 대신, 어떤 값이 어디서 쓰이는지 내부적으로 계속 계산하고 추적하는 런타임 비용을 집니다. 반면 React는 그 비용 대신, 상태 변경 시점을 개발자가 명시하게 하여 데이터 흐름과 렌더링 시점을 예측하기 쉽게 만드는 쪽을 택했습니다. 두 방식 모두 정당한 트레이드오프이며 우열의 문제가 아닙니다.',
    },
    {
      question:
        'React에서 컴포넌트가 다시 그려지는(Re-rendering) 경우는 언제 발생하나요?',
      answer:
        '크게 세 가지입니다. 첫째, useState의 setter 함수가 호출되어 상태가 변경될 때. 둘째, 부모 컴포넌트가 리렌더링될 때(자식은 props가 안 바뀌어도 React.memo가 없으면 기본적으로 함께 다시 그려집니다). 셋째, 구독 중인 Context 값이 바뀔 때입니다.',
    },
    {
      question:
        'Vue에서 ref로 선언한 상태를 count = count + 1 처럼 직접 재할당하면 왜 반응성이 끊어지나요?',
      answer:
        'ref()는 원시값을 Proxy 객체({ value: T })로 감싸서 반환합니다. count에 직접 값을 재할당하면 Proxy 래퍼 자체가 일반 숫자로 덮어씌워져 Vue의 반응성 추적 체계에서 완전히 이탈합니다. 스크립트에서는 반드시 count.value로 내부 프로퍼티를 조작해야 반응성 트래킹이 정상 동작합니다.',
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
    {
      label: '01_통합보고서 & 3_학습노트 (GitFind Dashboard)',
    },
  ],
};
