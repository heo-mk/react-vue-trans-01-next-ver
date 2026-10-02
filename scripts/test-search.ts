import { allConcepts } from '../content/index';
import { getContentPlainText, getComparisonCellPlainText } from '../content/schema';

function searchConcepts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return allConcepts.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      (c.cardTitle && c.cardTitle.toLowerCase().includes(q)) ||
      (c.cardSubtitle && c.cardSubtitle.toLowerCase().includes(q)) ||
      (c.cardSummary && c.cardSummary.toLowerCase().includes(q)) ||
      c.oneLineSummary.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.keywords && c.keywords.some((k) => k.toLowerCase().includes(q))) ||
      (c.analogy && getContentPlainText(c.analogy).toLowerCase().includes(q)) ||
      (c.pitfalls &&
        c.pitfalls.some(
          (p) =>
            p.question.toLowerCase().includes(q) ||
            getContentPlainText(p.answer).toLowerCase().includes(q)
        )) ||
      (c.comparisonTable &&
        c.comparisonTable.some(
          (row) =>
            row.label.toLowerCase().includes(q) ||
            getComparisonCellPlainText(row.left).toLowerCase().includes(q) ||
            getComparisonCellPlainText(row.right).toLowerCase().includes(q) ||
            getComparisonCellPlainText(row.common).toLowerCase().includes(q)
        ))
  );
}

const testQueries = [
  '동기화 부담', // global-state pitfall item term
  '이중 네트워크', // rendering-modes pitfall item term
  'Double Fetching', // rendering-modes pitfall item term
  '초인종', // reactivity-state analogy
  'Nitro', // rendering-modes analogy/keyword
  'CCTV', // reactivity-state & options-to-composition analogy
  'Stale 마킹', // server-state pitfall item term
  'toRefs', // options-to-composition pitfall & keywords
  'useState', // Navbar placeholder 예시
  'ref', // Navbar placeholder 예시
  'RSC', // Navbar placeholder 예시
  'Zustand', // Navbar placeholder 예시
];

console.log('=== 검색 기능 테스트 ===');
let failedCount = 0;
for (const q of testQueries) {
  const results = searchConcepts(q);
  console.log(`- '${q}' 검색: ${results.length}건 매칭 -> [${results.map((r) => r.slug).join(', ')}]`);
  if (results.length === 0) {
    failedCount++;
  }
}

if (failedCount > 0) {
  console.error(`❌ ${failedCount}개의 테스트 쿼리에서 검색 결과가 0건입니다.`);
  process.exit(1);
}
