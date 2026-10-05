export type Axis = 'react-vue' | 'vue2-vue3' | 'nuxt-next';

export type ComparisonCellContent = string | { lead?: string; items: string[] };

export interface ComparisonRow {
  label: string;
  left?: ComparisonCellContent; // React 또는 Vue2 또는 Nuxt3
  right?: ComparisonCellContent; // Vue 또는 Vue3 또는 Next
  common?: ComparisonCellContent; // React·Vue 공통 내용 (colspan=2)
}

export interface CodeHighlight {
  side: 'left' | 'right';
  match: string;
  id: number;
}

export interface KeyPoint {
  id: number;
  title: string;
  left: string;
  right: string;
}

export interface CodeExample {
  label: string; // '기초 예제' | '실전 예제'
  version: string; // 'React 18+', 'Vue 3.4+' 등 — 4-6 규칙 강제
  leftCode: string; // Before / React / Vue2
  rightCode: string; // After / Vue / Vue3
  sourceProject?: string; // 실전 예제일 경우 적용 도메인/시나리오 예시
  highlights?: CodeHighlight[];
  keyPoints?: KeyPoint[];
}

export interface StructuredItem {
  term?: string; // 굵게 강조할 핵심어 (선택)
  desc: string; // 본문 설명
}

export interface StructuredContent {
  lead?: string; // 결론 한 줄 또는 도입 문장
  listType: 'ordered' | 'bullet'; // 'ordered' -> 1), 2), 3) / 'bullet' -> •
  items: StructuredItem[]; // 목록 항목들 (2~5개 권장)
  closing?: string; // 마무리 한 줄
}

export type FormattedContent = string | StructuredContent;

export interface Pitfall {
  question: string; // 면접/학습 함정 질문
  answer: FormattedContent; // 함정 없는 답변 (문자열 또는 구조화 목록)
}

export interface ConceptPage {
  slug: string;
  axis: Axis;
  title: string;
  cardTitle: string; // 카드 그리드용 핵심 타이틀 (20자 이내)
  cardSubtitle?: string; // 카드 그리드용 보조 설명
  cardSummary: string; // 카드 그리드용 전용 요약문 (45자 이내, 한 문장)
  oneLineSummary: string; // 파인만 테크닉 — 어린아이도 이해할 요약
  keywords: string[]; // 검색 및 색인용 키워드 목록
  analogy?: FormattedContent; // 비유 (출처가 있으면 sourceNote에 명시)
  comparisonNote?: string; // 비교표 상단 참고 문구
  comparisonTable: ComparisonRow[];
  codeExamples: CodeExample[];
  diagramId?: string; // /scripts/build-diagrams.ts가 생성하는 svg id
  pitfalls: Pitfall[];
  sources: { label: string; url: string }[]; // 클릭 가능한 외부 공식 문서 URL 필수
  sourceNote?: string; // 인용 표현을 그대로 가져온 경우 출처 명시 (3-6 규칙)
}
