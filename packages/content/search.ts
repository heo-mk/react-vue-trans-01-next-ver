import type { ConceptPage } from './schema';
import { getContentPlainText, getComparisonCellPlainText } from './schema';

/**
 * 개념 목록에서 검색어를 포함하는 개념을 필터링하는 순수 함수.
 * 동작 기준: apps/web Navbar.tsx 및 apps/api search.ts
 *
 * @param concepts 검색 대상 개념 배열
 * @param query 검색어 문자열
 * @returns 매칭된 개념 배열 (순서 유지)
 */
export function searchConcepts(
  concepts: ConceptPage[],
  query: string
): ConceptPage[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return concepts.filter(
    (c) =>
      c.title.toLowerCase().includes(normalized) ||
      (c.cardTitle && c.cardTitle.toLowerCase().includes(normalized)) ||
      (c.cardSubtitle && c.cardSubtitle.toLowerCase().includes(normalized)) ||
      (c.cardSummary && c.cardSummary.toLowerCase().includes(normalized)) ||
      c.oneLineSummary.toLowerCase().includes(normalized) ||
      c.slug.toLowerCase().includes(normalized) ||
      (c.keywords &&
        c.keywords.some((k) => k.toLowerCase().includes(normalized))) ||
      (c.analogy &&
        getContentPlainText(c.analogy).toLowerCase().includes(normalized)) ||
      (c.pitfalls &&
        c.pitfalls.some(
          (p) =>
            p.question.toLowerCase().includes(normalized) ||
            getContentPlainText(p.answer).toLowerCase().includes(normalized)
        )) ||
      (c.comparisonTable &&
        c.comparisonTable.some(
          (row) =>
            row.label.toLowerCase().includes(normalized) ||
            getComparisonCellPlainText(row.left).toLowerCase().includes(normalized) ||
            getComparisonCellPlainText(row.right).toLowerCase().includes(normalized) ||
            getComparisonCellPlainText(row.common).toLowerCase().includes(normalized)
        ))
  );
}
