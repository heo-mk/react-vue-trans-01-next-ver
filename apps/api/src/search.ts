import { allConcepts } from '@repo/content';
import {
  getContentPlainText,
  getComparisonCellPlainText,
  type ConceptPage,
} from '@repo/content/schema';

export function searchConcepts(searchQuery: string): ConceptPage[] {
  const query = searchQuery.trim().toLowerCase();
  if (!query) {
    return [];
  }

  return allConcepts.filter(
    (c) =>
      c.title.toLowerCase().includes(query) ||
      (c.cardTitle && c.cardTitle.toLowerCase().includes(query)) ||
      (c.cardSubtitle && c.cardSubtitle.toLowerCase().includes(query)) ||
      (c.cardSummary && c.cardSummary.toLowerCase().includes(query)) ||
      c.oneLineSummary.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query) ||
      (c.keywords &&
        c.keywords.some((k) => k.toLowerCase().includes(query))) ||
      (c.analogy &&
        getContentPlainText(c.analogy).toLowerCase().includes(query)) ||
      (c.pitfalls &&
        c.pitfalls.some(
          (p) =>
            p.question.toLowerCase().includes(query) ||
            getContentPlainText(p.answer).toLowerCase().includes(query)
        )) ||
      (c.comparisonTable &&
        c.comparisonTable.some(
          (row) =>
            row.label.toLowerCase().includes(query) ||
            getComparisonCellPlainText(row.left).toLowerCase().includes(query) ||
            getComparisonCellPlainText(row.right).toLowerCase().includes(query) ||
            getComparisonCellPlainText(row.common).toLowerCase().includes(query)
        ))
  );
}
