import {
  allConcepts,
  axisMetadata,
  getAllConcepts,
  getConcept,
  getConceptsByAxis,
} from './content/index.js';
import type { Axis as ContentAxis, ConceptPage } from '@repo/schema';
import {
  mapFormattedContent,
  mapComparisonCellContent,
} from './mapping.js';
import { searchConcepts } from './search.js';

export const resolvers = {
  Axis: {
    REACT_VUE: 'react-vue',
    VUE2_VUE3: 'vue2-vue3',
    NUXT_NEXT: 'nuxt-next',
  },
  Side: {
    LEFT: 'left',
    RIGHT: 'right',
  },
  ListType: {
    ORDERED: 'ordered',
    BULLET: 'bullet',
  },
  FormattedContent: {
    __resolveType(obj: any) {
      if (obj.__typename) {
        return obj.__typename;
      }
      if (typeof obj === 'string' || (obj && 'value' in obj)) {
        return 'PlainText';
      }
      return 'StructuredContent';
    },
  },
  ComparisonCellContent: {
    __resolveType(obj: any) {
      if (obj.__typename) {
        return obj.__typename;
      }
      if (typeof obj === 'string' || (obj && 'value' in obj)) {
        return 'PlainText';
      }
      return 'ComparisonCellItems';
    },
  },
  Concept: {
    analogy: (parent: ConceptPage) => mapFormattedContent(parent.analogy),
    comparisonTable: (parent: ConceptPage) => {
      return parent.comparisonTable.map((row) => ({
        label: row.label,
        left: mapComparisonCellContent(row.left),
        right: mapComparisonCellContent(row.right),
        common: mapComparisonCellContent(row.common),
      }));
    },
    pitfalls: (parent: ConceptPage) => {
      return parent.pitfalls.map((p) => ({
        question: p.question,
        answer: mapFormattedContent(p.answer),
      }));
    },
  },
  Query: {
    axes: () => {
      const axesKeys: ContentAxis[] = ['react-vue', 'vue2-vue3', 'nuxt-next'];
      return axesKeys.map((axisKey) => {
        const meta = axisMetadata[axisKey];
        return {
          axis: axisKey,
          title: meta.title,
          subtitle: meta.subtitle,
          description: meta.description,
          badge: meta.badge,
          leftFramework: meta.leftFramework,
          rightFramework: meta.rightFramework,
        };
      });
    },
    concepts: (_: unknown, args: { axis?: ContentAxis }) => {
      if (args.axis) {
        return getConceptsByAxis(args.axis);
      }
      return getAllConcepts();
    },
    concept: (_: unknown, args: { axis: ContentAxis; slug: string }) => {
      const found = getConcept(args.axis, args.slug);
      return found ?? null;
    },
    search: (_: unknown, args: { query: string }) => {
      return searchConcepts(args.query);
    },
  },
};
