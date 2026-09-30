import { allConcepts } from '../content/index';
import { getContentPlainText } from '../content/schema';

const ASSERTIVE_WORDS = ['완벽히', '완벽하게', '전혀', '반드시', '무조건'];

console.log('=== 단정 표현 탐색 결과 ===');
for (const c of allConcepts) {
  const id = `${c.cardTitle || c.title} (${c.slug})`;

  const check = (text: string, location: string) => {
    ASSERTIVE_WORDS.forEach((word) => {
      if (text.includes(word)) {
        console.log(`[${id}] [${location}] 단정 표현 '${word}' 발견: "${text}"`);
      }
    });
  };

  if (c.oneLineSummary) check(c.oneLineSummary, 'oneLineSummary');
  if (c.analogy) check(getContentPlainText(c.analogy), 'analogy');
  if (c.comparisonNote) check(c.comparisonNote, 'comparisonNote');
  c.pitfalls.forEach((p, i) => {
    check(p.question, `pitfall[${i + 1}].question`);
    check(getContentPlainText(p.answer), `pitfall[${i + 1}].answer`);
  });
  c.comparisonTable.forEach((row, i) => {
    if (row.left) check(row.left, `table[${i + 1}].left`);
    if (row.right) check(row.right, `table[${i + 1}].right`);
    if (row.common) check(row.common, `table[${i + 1}].common`);
  });
}

console.log('\n=== 중복 표현/구절 탐색 ===');
for (const c of allConcepts) {
  const id = `${c.cardTitle || c.title} (${c.slug})`;
  c.pitfalls.forEach((p, i) => {
    const answerText = getContentPlainText(p.answer);
    const words = answerText.split(/\s+/);
    for (let w = 0; w < words.length - 1; w++) {
      if (words[w].length >= 2 && words[w] === words[w + 1]) {
        console.log(`[${id}] pitfall[${i + 1}] 연속 단어 반복: "${words[w]}" in "${answerText}"`);
      }
    }
    const match = answerText.match(/(.{3,20}).{0,15}\1/);
    if (match) {
      console.log(`[${id}] pitfall[${i + 1}] 의심 패턴 ("${match[1]}"): "${answerText}"`);
    }
  });
}
