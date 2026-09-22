import { Axis, ConceptPage } from './schema';
import { reactivityState } from './concepts/react-vue/reactivity-state';
import { globalState } from './concepts/react-vue/global-state';
import { serverState } from './concepts/react-vue/server-state';
import { optionsToComposition } from './concepts/vue2-vue3/options-to-composition';
import { renderingModes } from './concepts/nuxt-next/rendering-modes';

export const allConcepts: ConceptPage[] = [
  reactivityState,
  globalState,
  serverState,
  optionsToComposition,
  renderingModes,
];

export const axisMetadata: Record<
  Axis,
  {
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    leftFramework: string;
    rightFramework: string;
  }
> = {
  'react-vue': {
    title: 'React ↔ Vue',
    subtitle: '두 거대 생태계의 멘탈 모델 전환',
    description:
      'JSX와 Virtual DOM 기반의 불변성 세계에서, Template과 Proxy 기반의 반응성 세계로 오가는 실무 아키텍처 비교',
    badge: '축 1',
    leftFramework: 'React 18+',
    rightFramework: 'Vue 3.4+',
  },
  'vue2-vue3': {
    title: 'Vue2 → Vue3',
    subtitle: '레거시에서 모던 Vue로의 점진적 도약',
    description:
      'Options API와 Mixins의 한계를 극복하고, <script setup>과 Composition API로 안전하게 마이그레이션하는 실전 지침',
    badge: '축 2',
    leftFramework: 'Vue 2.7+ (Options)',
    rightFramework: 'Vue 3.4+ (Composition)',
  },
  'nuxt-next': {
    title: 'Nuxt3 ↔ Next.js',
    subtitle: '엔터프라이즈 풀스택 프레임워크 비교',
    description:
      'Next.js의 React Server Components(RSC) 아키텍처와 Nuxt 3의 Universal / Nitro 엔진의 서버 렌더링 및 배포 전략 분석',
    badge: '축 3',
    leftFramework: 'Next.js 15+ (App Router)',
    rightFramework: 'Nuxt 3.14+ (Nitro)',
  },
};

export function getConceptsByAxis(axis: Axis): ConceptPage[] {
  return allConcepts.filter((concept) => concept.axis === axis);
}

export function getConcept(axis: Axis, slug: string): ConceptPage | undefined {
  return allConcepts.find(
    (concept) => concept.axis === axis && concept.slug === slug
  );
}

export function getAllConcepts(): ConceptPage[] {
  return allConcepts;
}
