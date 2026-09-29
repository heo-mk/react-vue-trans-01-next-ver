const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/inspection-result.json', 'utf-8'));

// Filter only h1, h2, h3 headings
const h123 = data.allHeadings.filter(h => ['h1', 'h2', 'h3'].includes(h.tag));
const multiLine = h123.filter(h => h.lines1280 > 1 || h.lines768 > 1 || h.lines375 > 1);

console.log('| 페이지 | 태그 | 제목 문구 | 1280px | 768px | 375px | 렌더링 줄바꿈 형태 (375px 기준) | 단어·용어 쪼개짐 여부 |');
console.log('|:---|:---:|:---|:---:|:---:|:---:|:---|:---:|');
for (const h of multiLine) {
  const isSplit = h.splitsWord1280 || h.splitsWord768 || h.splitsWord375;
  const splitsStr = isSplit ? '⚠️ 쪼개짐 발생' : '✅ 어절 단위 줄바꿈';
  const breaks375Str = (h.breaks375 || []).join(' / ');
  console.log(`| ${h.page} | \`${h.tag}\` | ${h.text} | ${h.lines1280}줄 | ${h.lines768}줄 | ${h.lines375}줄 | ${breaks375Str} | ${splitsStr} |`);
}
