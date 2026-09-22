import { ConceptPage } from '../../schema';

export const reactivityState: ConceptPage = {
  slug: 'reactivity-state',
  axis: 'react-vue',
  title: '상태와 반응성 모델 (useState vs ref/reactive)',
  oneLineSummary:
    'React는 값이 바뀌면 컴포넌트 함수 전체를 다시 실행해 화면을 덮어쓰고, Vue는 값에 센서(Proxy)를 달아 변경된 부분만 콕 집어 스스로 업데이트합니다.',
  analogy:
    'React는 방에 가구가 바뀌면 방 전체를 사진 찍어 이전 사진과 비교한 뒤 바뀐 곳을 고치는 방식이고, Vue는 각 가구에 벨을 달아두어 누군가 건드리면 즉시 담당 인부에게 알림이 가는 방식입니다.',
  comparisonTable: [
    {
      label: '반응성 동작 원리',
      left: '불변성(Immutability) 기반. 상태 변경 함수(setter) 호출 시 컴포넌트 함수 재실행 및 가상 DOM Diffing',
      right:
        '가변 프록시(Proxy) 기반. 의존성 추적(Dependency Tracking)을 통해 변경된 DOM 노드만 정밀 업데이트',
    },
    {
      label: '값 읽기 및 쓰기',
      left: 'getter/setter 분리 (`const [count, setCount] = useState(0)`)',
      right:
        '단일 래퍼 객체 (`const count = ref(0)`). 스크립트에서는 `count.value`, 템플릿에서는 자동 언래핑',
    },
    {
      label: '객체/배열 업데이트',
      left: '항상 새로운 복사본 객체를 생성해 전달 (`setObj({ ...obj, key: val })`)',
      right:
        '직접 속성 변경 허용 (`obj.key = val`). 깊은 반응성(Deep Reactivity) 자동 지원',
    },
    {
      label: '구조 분해 할당',
      left: '상태 값 자체는 일반 원시값/객체이므로 자유롭게 구조 분해 가능',
      right:
        '`reactive` 객체를 단순 구조 분해하면 반응성이 유실됨 (`toRefs` 필수)',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'React 18+ vs Vue 3.4+',
      leftCode: `// [React] Counter.tsx (React 18+)
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState<number>(0);

  const increment = () => {
    // 반드시 setter 함수를 통해 새로운 값 전달
    setCount((prev) => prev + 1);
  };

  return (
    <button onClick={increment}>
      클릭 횟수: {count}
    </button>
  );
}`,
      rightCode: `<!-- [Vue] Counter.vue (Vue 3.4+) -->
<script setup lang="ts">
import { ref } from 'vue';

// ref를 통해 반응형 상태 정의
const count = ref<number>(0);

const increment = () => {
  // 스크립트 내부에서는 .value로 직접 수정
  count.value++;
};
</script>

<template>
  <!-- 템플릿에서는 .value 없이 직접 접근 (자동 언래핑) -->
  <button @click="increment">
    클릭 횟수: {{ count }}
  </button>
</template>`,
    },
    {
      label: '실전 예제',
      version: 'React 18+ vs Vue 3.4+',
      sourceProject: 'E-Commerce Cart Management',
      leftCode: `// [React] 실전 장바구니 수량 변경 (불변성 유지 패턴)
interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

const updateQuantity = (id: string, delta: number) => {
  setCartItems((prevItems) =>
    prevItems.map((item) => {
      if (item.id === id) {
        const nextQty = Math.max(1, item.quantity + delta);
        // 새로운 객체 참조를 반환해야만 리렌더링 발생
        return { ...item, quantity: nextQty };
      }
      return item;
    })
  );
};`,
      rightCode: `// [Vue] 실전 장바구니 수량 변경 (Proxy 직접 변이 패턴)
interface CartItem {
  id: string;
  name: string;
  quantity: number;
}

const cartItems = ref<CartItem[]>([]);

const updateQuantity = (id: string, delta: number) => {
  const target = cartItems.value.find((item) => item.id === id);
  if (target) {
    // Proxy가 속성 쓰기(set)를 가로채어 해당 항목만 정밀 업데이트
    target.quantity = Math.max(1, target.quantity + delta);
  }
};`,
    },
  ],
  diagramId: 'reactivity-diagram',
  pitfalls: [
    {
      question:
        'Vue에서 ref로 선언한 상태를 스크립트에서 count = count + 1 로 쓰면 왜 화면이 갱신되지 않나요?',
      answer:
        'ref는 원시값을 Proxy로 감싸기 위해 { value: T } 형태의 참조 객체를 반환합니다. count에 직접 할당하면 Proxy 래퍼 자체가 덮어씌워져 의존성 추적 연결고리가 끊어집니다. 반드시 count.value로 내부 값을 조작해야 반응성 트리거가 작동합니다.',
    },
    {
      question:
        'React에서 객체 내부 속성만 변경하고(obj.title = "new") setState(obj)를 호출하면 화면이 안 바뀌는 이유는 무엇인가요?',
      answer:
        'React는 Object.is()를 사용한 얕은 비교(Shallow Comparison)로 이전 상태와 새 상태의 참조값(Reference)이 같은지 검사합니다. 객체 내부 속성만 바꾸면 메모리 주소(참조)가 동일하므로 React는 상태가 바뀌지 않았다고 판단하여 리렌더링을 건너뜁니다. 반드시 새 객체({...obj, title: "new"})를 생성해 넘겨야 합니다.',
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
