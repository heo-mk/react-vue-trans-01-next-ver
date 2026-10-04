import type {
  Axis,
  ConceptPage,
  ComparisonRow,
  ComparisonCellContent,
  CodeExample,
  Pitfall,
  FormattedContent,
  StructuredContent,
} from '@repo/content/schema';
import { toContentAxis } from './axis';
import type {
  GraphQLAxisInfo,
  GraphQLConceptCard,
  GraphQLConceptDetail,
  GraphQLFormattedContent,
  GraphQLComparisonCellContent,
  GraphQLComparisonRow,
  GraphQLCodeExample,
  GraphQLPitfall,
} from './types';

export type AxisMeta = {
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  leftFramework: string;
  rightFramework: string;
};

export type ConceptCard = Pick<
  ConceptPage,
  | 'axis'
  | 'slug'
  | 'title'
  | 'cardTitle'
  | 'cardSubtitle'
  | 'cardSummary'
  | 'oneLineSummary'
>;

function adaptFormattedContent(
  fc: GraphQLFormattedContent | null | undefined
): FormattedContent | undefined {
  if (fc === null || fc === undefined) {
    return undefined;
  }
  if (fc.__typename === 'PlainText') {
    return fc.value;
  }
  if (fc.__typename === 'StructuredContent') {
    const res: StructuredContent = {
      listType: fc.listType === 'ORDERED' ? 'ordered' : 'bullet',
      items: fc.items.map((item) => {
        const it: { desc: string; term?: string } = { desc: item.desc };
        if (item.term !== null && item.term !== undefined) {
          it.term = item.term;
        }
        return it;
      }),
    };
    if (fc.lead !== null && fc.lead !== undefined) {
      res.lead = fc.lead;
    }
    if (fc.closing !== null && fc.closing !== undefined) {
      res.closing = fc.closing;
    }
    return res;
  }
  return undefined;
}

function adaptComparisonCellContent(
  cell: GraphQLComparisonCellContent | null | undefined
): ComparisonCellContent | undefined {
  if (cell === null || cell === undefined) {
    return undefined;
  }
  if (cell.__typename === 'PlainText') {
    return cell.value;
  }
  if (cell.__typename === 'ComparisonCellItems') {
    const res: { lead?: string; items: string[] } = {
      items: [...cell.items],
    };
    if (cell.lead !== null && cell.lead !== undefined) {
      res.lead = cell.lead;
    }
    return res;
  }
  return undefined;
}

function adaptComparisonRow(row: GraphQLComparisonRow): ComparisonRow {
  const r: ComparisonRow = {
    label: row.label,
  };
  if (row.left !== null && row.left !== undefined) {
    const left = adaptComparisonCellContent(row.left);
    if (left !== undefined) {
      r.left = left;
    }
  }
  if (row.right !== null && row.right !== undefined) {
    const right = adaptComparisonCellContent(row.right);
    if (right !== undefined) {
      r.right = right;
    }
  }
  if (row.common !== null && row.common !== undefined) {
    const common = adaptComparisonCellContent(row.common);
    if (common !== undefined) {
      r.common = common;
    }
  }
  return r;
}

function adaptCodeExample(ex: GraphQLCodeExample): CodeExample {
  const e: CodeExample = {
    label: ex.label,
    version: ex.version,
    leftCode: ex.leftCode,
    rightCode: ex.rightCode,
  };
  if (ex.sourceProject !== null && ex.sourceProject !== undefined) {
    e.sourceProject = ex.sourceProject;
  }
  if (
    ex.highlights !== null &&
    ex.highlights !== undefined &&
    ex.highlights.length > 0
  ) {
    e.highlights = ex.highlights.map((h) => ({
      id: h.id,
      side: h.side === 'LEFT' ? 'left' : 'right',
      match: h.match,
    }));
  }
  if (
    ex.keyPoints !== null &&
    ex.keyPoints !== undefined &&
    ex.keyPoints.length > 0
  ) {
    e.keyPoints = ex.keyPoints.map((kp) => ({
      id: kp.id,
      title: kp.title,
      left: kp.left,
      right: kp.right,
    }));
  }
  return e;
}

function adaptPitfall(p: GraphQLPitfall): Pitfall {
  const answer = adaptFormattedContent(p.answer);
  if (answer === undefined) {
    throw new Error('Pitfall answer는 필수 값입니다.');
  }
  return {
    question: p.question,
    answer,
  };
}

export function toConceptPage(raw: GraphQLConceptDetail): ConceptPage {
  const page: ConceptPage = {
    slug: raw.slug,
    axis: toContentAxis(raw.axis),
    title: raw.title,
    cardTitle: raw.cardTitle,
    cardSummary: raw.cardSummary,
    oneLineSummary: raw.oneLineSummary,
    keywords: [...raw.keywords],
    comparisonTable: raw.comparisonTable.map(adaptComparisonRow),
    codeExamples: raw.codeExamples.map(adaptCodeExample),
    pitfalls: raw.pitfalls.map(adaptPitfall),
    sources: raw.sources.map((s) => ({ label: s.label, url: s.url })),
  };

  if (raw.cardSubtitle !== null && raw.cardSubtitle !== undefined) {
    page.cardSubtitle = raw.cardSubtitle;
  }
  if (raw.analogy !== null && raw.analogy !== undefined) {
    const analogy = adaptFormattedContent(raw.analogy);
    if (analogy !== undefined) {
      page.analogy = analogy;
    }
  }
  if (raw.comparisonNote !== null && raw.comparisonNote !== undefined) {
    page.comparisonNote = raw.comparisonNote;
  }
  if (raw.diagramId !== null && raw.diagramId !== undefined) {
    page.diagramId = raw.diagramId;
  }
  if (raw.sourceNote !== null && raw.sourceNote !== undefined) {
    page.sourceNote = raw.sourceNote;
  }

  return page;
}

export function toConceptCard(raw: GraphQLConceptCard): ConceptCard {
  const card: ConceptCard = {
    axis: toContentAxis(raw.axis),
    slug: raw.slug,
    title: raw.title,
    cardTitle: raw.cardTitle,
    cardSummary: raw.cardSummary,
    oneLineSummary: raw.oneLineSummary,
  };

  if (raw.cardSubtitle !== null && raw.cardSubtitle !== undefined) {
    card.cardSubtitle = raw.cardSubtitle;
  }

  return card;
}

export function toAxisMetaMap(
  axes: GraphQLAxisInfo[]
): Record<Axis, AxisMeta> {
  const map: Partial<Record<Axis, AxisMeta>> = {};
  for (const a of axes) {
    const axisKey = toContentAxis(a.axis);
    map[axisKey] = {
      title: a.title,
      subtitle: a.subtitle,
      description: a.description,
      badge: a.badge,
      leftFramework: a.leftFramework,
      rightFramework: a.rightFramework,
    };
  }
  return map as Record<Axis, AxisMeta>;
}
