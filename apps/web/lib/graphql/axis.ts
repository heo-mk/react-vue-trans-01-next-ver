import type { Axis } from '@repo/schema';

export type GraphQLAxis = 'REACT_VUE' | 'VUE2_VUE3' | 'NUXT_NEXT';

export function toGraphQLAxis(axis: Axis): GraphQLAxis {
  switch (axis) {
    case 'react-vue':
      return 'REACT_VUE';
    case 'vue2-vue3':
      return 'VUE2_VUE3';
    case 'nuxt-next':
      return 'NUXT_NEXT';
    default:
      throw new Error(`알 수 없는 Axis 값입니다: ${axis}`);
  }
}

export function toContentAxis(axis: string): Axis {
  switch (axis) {
    case 'REACT_VUE':
      return 'react-vue';
    case 'VUE2_VUE3':
      return 'vue2-vue3';
    case 'NUXT_NEXT':
      return 'nuxt-next';
    default:
      throw new Error(`알 수 없는 GraphQL Axis 값입니다: ${axis}`);
  }
}
