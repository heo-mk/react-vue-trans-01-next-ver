import { allConcepts } from '../src/content/index.js';
import { searchConcepts } from '../src/content/search.js';


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
  const results = searchConcepts(allConcepts, q);
  console.log(`- '${q}' 검색: ${results.length}건 매칭 -> [${results.map((r) => r.slug).join(', ')}]`);
  if (results.length === 0) {
    failedCount++;
  }
}

if (failedCount > 0) {
  console.error(`❌ ${failedCount}개의 테스트 쿼리에서 검색 결과가 0건입니다.`);
  process.exit(1);
}
