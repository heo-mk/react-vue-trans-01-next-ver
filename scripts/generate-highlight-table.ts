import { allConcepts } from '../content';

function generateTable() {
  console.log('| 파일 | 번호 | 예제 이름 | 왼쪽 줄수 | 오른쪽 줄수 | 하이라이트 ID별 줄 번호 (Left / Right) | 단일행 매칭 검증 상태 |');
  console.log('|---|:---:|---|:---:|:---:|---|---|');

  let exCount = 0;
  for (const concept of allConcepts) {
    if (!concept.codeExamples) continue;

    concept.codeExamples.forEach((ex, idx) => {
      exCount++;
      const leftLines = ex.leftCode.split('\n');
      const rightLines = ex.rightCode.split('\n');
      const fileName = `${concept.axis}/${concept.slug}.ts`;

      const idMap: Record<number, { left: number[]; right: number[] }> = {};
      const statusList: string[] = [];

      if (ex.highlights) {
        for (const hl of ex.highlights) {
          if (!idMap[hl.id]) idMap[hl.id] = { left: [], right: [] };
          const lines = hl.side === 'left' ? leftLines : rightLines;
          const matched: number[] = [];
          lines.forEach((line, lIdx) => {
            if (line.includes(hl.match)) {
              matched.push(lIdx + 1);
            }
          });

          idMap[hl.id][hl.side].push(...matched);

          if (matched.length === 1) {
            // 정상
          } else if (matched.length === 0) {
            statusList.push(`⚠️ ID ${hl.id}(${hl.side}): 0줄 불일치! ("${hl.match}")`);
          } else {
            statusList.push(`ℹ️ ID ${hl.id}(${hl.side}): ${matched.length}줄 일치 (L${matched.join(', L')})`);
          }
        }
      }

      const hlSummary = Object.keys(idMap)
        .map(Number)
        .sort((a, b) => a - b)
        .map((id) => {
          const lStr = idMap[id].left.length ? `L${idMap[id].left.join(',')}` : '-';
          const rStr = idMap[id].right.length ? `L${idMap[id].right.join(',')}` : '-';
          return `id ${id}: (${lStr} / ${rStr})`;
        })
        .join('<br>');

      const statusCol = statusList.length === 0 ? '모든 match 1줄 일치' : statusList.join('<br>');

      console.log(
        `| \`${fileName}\` | [${idx}] | ${ex.label} (${ex.version || ''}) | ${leftLines.length} | ${rightLines.length} | ${hlSummary || '없음'} | ${statusCol} |`
      );
    });
  }
}

generateTable();
