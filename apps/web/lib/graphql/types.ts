import type { GraphQLAxis } from './axis';

export type { GraphQLAxis };

export type GraphQLSide = 'LEFT' | 'RIGHT';
export type GraphQLListType = 'ORDERED' | 'BULLET';

export interface GraphQLAxisInfo {
  axis: GraphQLAxis;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  leftFramework: string;
  rightFramework: string;
}

export interface GraphQLAxesResponse {
  axes: GraphQLAxisInfo[];
}

export interface GraphQLConceptCard {
  axis: GraphQLAxis;
  slug: string;
  title: string;
  cardTitle: string;
  cardSubtitle: string | null;
  cardSummary: string;
  oneLineSummary: string;
}

export interface GraphQLConceptCardsResponse {
  concepts: GraphQLConceptCard[];
}

export interface GraphQLConceptParam {
  axis: GraphQLAxis;
  slug: string;
  title: string;
  oneLineSummary: string;
}

export interface GraphQLConceptParamsResponse {
  concepts: GraphQLConceptParam[];
}

export interface GraphQLPlainText {
  __typename: 'PlainText';
  value: string;
}

export interface GraphQLStructuredItem {
  term: string | null;
  desc: string;
}

export interface GraphQLStructuredContent {
  __typename: 'StructuredContent';
  lead: string | null;
  listType: GraphQLListType;
  items: GraphQLStructuredItem[];
  closing: string | null;
}

export type GraphQLFormattedContent =
  | GraphQLPlainText
  | GraphQLStructuredContent;

export interface GraphQLComparisonCellItems {
  __typename: 'ComparisonCellItems';
  lead: string | null;
  items: string[];
}

export type GraphQLComparisonCellContent =
  | GraphQLPlainText
  | GraphQLComparisonCellItems;

export interface GraphQLComparisonRow {
  label: string;
  left: GraphQLComparisonCellContent | null;
  right: GraphQLComparisonCellContent | null;
  common: GraphQLComparisonCellContent | null;
}

export interface GraphQLCodeHighlight {
  id: number;
  side: GraphQLSide;
  match: string;
}

export interface GraphQLKeyPoint {
  id: number;
  title: string;
  left: string;
  right: string;
}

export interface GraphQLCodeExample {
  label: string;
  version: string;
  leftCode: string;
  rightCode: string;
  sourceProject: string | null;
  highlights: GraphQLCodeHighlight[] | null;
  keyPoints: GraphQLKeyPoint[] | null;
}

export interface GraphQLPitfall {
  question: string;
  answer: GraphQLFormattedContent;
}

export interface GraphQLSource {
  label: string;
  url: string;
}

export interface GraphQLConceptDetail {
  slug: string;
  axis: GraphQLAxis;
  title: string;
  cardTitle: string;
  cardSubtitle: string | null;
  cardSummary: string;
  oneLineSummary: string;
  keywords: string[];
  diagramId: string | null;
  comparisonNote: string | null;
  sourceNote: string | null;
  analogy: GraphQLFormattedContent | null;
  comparisonTable: GraphQLComparisonRow[];
  codeExamples: GraphQLCodeExample[];
  pitfalls: GraphQLPitfall[];
  sources: GraphQLSource[];
}

export interface GraphQLConceptDetailResponse {
  concept: GraphQLConceptDetail | null;
}
