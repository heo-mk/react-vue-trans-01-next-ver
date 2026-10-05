import type {
  Axis as ContentAxis,
  FormattedContent as ContentFormattedContent,
  ComparisonCellContent as ContentComparisonCellContent,
} from '@repo/schema';

export type GraphQLAxis = 'REACT_VUE' | 'VUE2_VUE3' | 'NUXT_NEXT';
export type GraphQLSide = 'LEFT' | 'RIGHT';
export type GraphQLListType = 'ORDERED' | 'BULLET';

export const AXIS_CONTENT_TO_GRAPHQL: Record<ContentAxis, GraphQLAxis> = {
  'react-vue': 'REACT_VUE',
  'vue2-vue3': 'VUE2_VUE3',
  'nuxt-next': 'NUXT_NEXT',
};

export const AXIS_GRAPHQL_TO_CONTENT: Record<GraphQLAxis, ContentAxis> = {
  REACT_VUE: 'react-vue',
  VUE2_VUE3: 'vue2-vue3',
  NUXT_NEXT: 'nuxt-next',
};

export function toContentAxis(axis: GraphQLAxis): ContentAxis {
  return AXIS_GRAPHQL_TO_CONTENT[axis];
}

export function toGraphQLAxis(axis: ContentAxis): GraphQLAxis {
  return AXIS_CONTENT_TO_GRAPHQL[axis];
}

export function mapFormattedContent(
  content: ContentFormattedContent | undefined
): { __typename: 'PlainText'; value: string } | ({ __typename: 'StructuredContent' } & any) | null {
  if (content === undefined || content === null) {
    return null;
  }
  if (typeof content === 'string') {
    return {
      __typename: 'PlainText',
      value: content,
    };
  }
  return {
    __typename: 'StructuredContent',
    lead: content.lead,
    listType: content.listType,
    items: content.items,
    closing: content.closing,
  };
}

export function mapComparisonCellContent(
  cell: ContentComparisonCellContent | undefined
): { __typename: 'PlainText'; value: string } | ({ __typename: 'ComparisonCellItems'; lead?: string; items: string[] }) | null {
  if (cell === undefined || cell === null) {
    return null;
  }
  if (typeof cell === 'string') {
    return {
      __typename: 'PlainText',
      value: cell,
    };
  }
  return {
    __typename: 'ComparisonCellItems',
    lead: cell.lead,
    items: cell.items,
  };
}
