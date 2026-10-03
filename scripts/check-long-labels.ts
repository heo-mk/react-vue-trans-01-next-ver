import fs from 'fs';
import path from 'path';

const dir = 'content/diagrams';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.mmd'));

console.log('=== 모든 라벨 및 글자 수 검사 (한국어 10자 이상, <br/> 및 \\n 없음) ===');
for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf-8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const matches = Array.from(line.matchAll(/["']([^"']+)["']/g));
    for (const m of matches) {
      const label = m[1];
      if (label.startsWith('#') || label.length < 5) continue;
      if (!label.includes('<br/>') && !label.includes('\n') && !label.includes('<br>')) {
        const koreanMatch = label.match(/[가-힣]/g);
        const koreanChars = koreanMatch ? koreanMatch.length : 0;
        if (koreanChars >= 10) {
          console.log(`- 파일: ${f} (L${idx + 1})\n  문구: "${label}" (한글 ${koreanChars}자, 전체 ${label.length}자)`);
        }
      }
    }
  });
}
