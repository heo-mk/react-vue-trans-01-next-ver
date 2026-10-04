// 'use client' 파일에서 import하지 말 것 (서버 컴포넌트 전용)

import { cache } from 'react';
import type { Axis, ConceptPage } from '@repo/content/schema';
import { graphqlRequest } from './client';
import {
  AXES_QUERY,
  CONCEPT_CARDS_QUERY,
  CONCEPT_PARAMS_QUERY,
  CONCEPT_DETAIL_QUERY,
} from './queries';
import type {
  GraphQLAxesResponse,
  GraphQLConceptCardsResponse,
  GraphQLConceptParamsResponse,
  GraphQLConceptDetailResponse,
} from './types';
import {
  toAxisMetaMap,
  toConceptCard,
  toConceptPage,
  type AxisMeta,
  type ConceptCard,
} from './adapter';
import { toGraphQLAxis, toContentAxis } from './axis';

export type { AxisMeta, ConceptCard };

export interface ConceptParam {
  axis: Axis;
  slug: string;
  title: string;
  oneLineSummary: string;
}

export const getAxisMetaMap = cache(
  async (): Promise<Record<Axis, AxisMeta>> => {
    const data = await graphqlRequest<GraphQLAxesResponse>(AXES_QUERY);
    return toAxisMetaMap(data.axes);
  }
);

export const getConceptCards = cache(
  async (axis?: Axis): Promise<ConceptCard[]> => {
    const gqlAxis = axis ? toGraphQLAxis(axis) : undefined;
    const data = await graphqlRequest<GraphQLConceptCardsResponse>(
      CONCEPT_CARDS_QUERY,
      gqlAxis ? { axis: gqlAxis } : undefined
    );
    return data.concepts.map(toConceptCard);
  }
);

export const getConceptParams = cache(
  async (axis: Axis): Promise<ConceptParam[]> => {
    const gqlAxis = toGraphQLAxis(axis);
    const data = await graphqlRequest<GraphQLConceptParamsResponse>(
      CONCEPT_PARAMS_QUERY,
      { axis: gqlAxis }
    );
    return data.concepts.map((c) => ({
      axis: toContentAxis(c.axis),
      slug: c.slug,
      title: c.title,
      oneLineSummary: c.oneLineSummary,
    }));
  }
);

export const getConceptDetail = cache(
  async (axis: Axis, slug: string): Promise<ConceptPage | null> => {
    const gqlAxis = toGraphQLAxis(axis);
    const data = await graphqlRequest<GraphQLConceptDetailResponse>(
      CONCEPT_DETAIL_QUERY,
      {
        axis: gqlAxis,
        slug,
      }
    );
    if (!data.concept) {
      return null;
    }
    return toConceptPage(data.concept);
  }
);
