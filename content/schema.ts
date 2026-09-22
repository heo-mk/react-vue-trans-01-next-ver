export type Axis = 'react-vue' | 'vue2-vue3' | 'nuxt-next';

export interface ComparisonRow {
  label: string;
  left: string; // React 또는 Vue2 또는 Nuxt3
  right: string; // Vue 또는 Vue3 또는 Next
}

export interface CodeExample {
  label: string; // '기초 예제' | '실전 예제'
  version: string; // 'React 18+', 'Vue 3.4+' 등 — 4-6 규칙 강제
  leftCode: string; // Before / React / Vue2
  rightCode: string; // After / Vue / Vue3
  sourceProject?: string; // 실전 예제일 경우 포트폴리오 프로젝트명
}

export interface Pitfall {
  question: string; // 면접/학습 함정 질문
  answer: string; // 함정 없는 답변
}

export interface ConceptPage {
  slug: string;
  axis: Axis;
  title: string;
  oneLineSummary: string; // 파인만 테크닉 — 어린아이도 이해할 요약
  analogy?: string; // 비유 (출처가 있으면 sourceNote에 명시)
  comparisonTable: ComparisonRow[];
  codeExamples: CodeExample[];
  diagramId?: string; // /scripts/build-diagrams.ts가 생성하는 svg id
  pitfalls: Pitfall[];
  sources: { label: string; url?: string }[];
  sourceNote?: string; // 인용 표현을 그대로 가져온 경우 출처 명시 (3-6 규칙)
}
