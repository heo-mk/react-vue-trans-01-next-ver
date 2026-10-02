import { execSync } from 'child_process';
import { allConcepts } from '../content/index';
import { getComparisonCellPlainText, ComparisonCellContent } from '../content/schema';

// git HEAD에서 커밋 전 content/concepts 파일들의 원래 comparisonTable을 가져옵니다.
const origConceptsJson = execSync(
  `git show HEAD:content/index.ts`,
  { encoding: 'utf-8' }
);

function reconstruct(cell: ComparisonCellContent | undefined): string {
  if (!cell) return '';
  if (typeof cell === 'string') return cell;
  if (cell.lead) {
    return `${cell.lead}: ${cell.items.join(' ')}`;
  }
  return cell.items.join(' ');
}

function normalize(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

// 5개 파일의 git show 내용을 직접 파싱하거나 git diff에서 변경된 행을 검증합니다.
let totalChecked = 0;
let mismatchCount = 0;
const mismatches: any[] = [];

// 각 개념별로 검증
for (const c of allConcepts) {
  // git show HEAD:content/concepts/...
  let filePath = '';
  if (c.slug === 'global-state') filePath = 'content/concepts/react-vue/global-state.ts';
  else if (c.slug === 'reactivity-state') filePath = 'content/concepts/react-vue/reactivity-state.ts';
  else if (c.slug === 'server-state') filePath = 'content/concepts/react-vue/server-state.ts';
  else if (c.slug === 'options-to-composition') filePath = 'content/concepts/vue2-vue3/options-to-composition.ts';
  else if (c.slug === 'rendering-modes') filePath = 'content/concepts/nuxt-next/rendering-modes.ts';

  const origFileContent = execSync(`git show HEAD:${filePath}`, { encoding: 'utf-8' });

  c.comparisonTable.forEach((row, i) => {
    ['left', 'right', 'common'].forEach((key) => {
      const currentCell = (row as any)[key];
      if (!currentCell) return;
      totalChecked++;

      const reconstructed = reconstruct(currentCell);

      // origFileContent에서 원래 문자열을 찾아서 비교
      // reconstructed를 정규화한 것이 원래 파일에 포함되어 있는지 확인
      const normRecon = normalize(reconstructed);

      // 원본 파일 텍스트 정규화
      const normFile = normalize(origFileContent);
      if (!normFile.includes(normRecon)) {
        mismatchCount++;
        mismatches.push({
          slug: c.slug,
          row: i + 1,
          key,
          reconstructed: normRecon,
        });
      }
    });
  });
}

console.log(`=== A-5 원본 대비 검증 결과 ===`);
console.log(`총 검사 셀 수: ${totalChecked}`);
console.log(`불일치 건수: ${mismatchCount}`);
if (mismatchCount > 0) {
  console.error(`불일치 목록:`, JSON.stringify(mismatches, null, 2));
  process.exit(1);
} else {
  console.log(`✅ 모든 셀의 복원 문자열이 git HEAD 원본과 100% 일치합니다 (불일치 0건).`);
}
