import { allConcepts } from '../content/index';
import { getContentPlainText } from '../content/schema';

const WORDS = ['완벽히', '완벽하게', '전혀', '반드시', '무조건'];

console.log('=== 단정 표현 탐색 결과 ===');
for (const c of allConcepts) {
  const id = `${c.cardTitle || c.title} (${c.slug})`;

  c.pitfalls.forEach((p, i) => {
    const answerText = getContentPlainText(p.answer);
    WORDS.forEach((w) => {
      if (answerText.includes(w)) {
        console.log(`- [${id}] pitfalls[${i + 1}].answer: '${w}'\n  문맥: "${answerText}"`);
      }
      if (p.question.includes(w)) {
        console.log(`- [${id}] pitfalls[${i + 1}].question: '${w}'\n  문맥: "${p.question}"`);
      }
    });
  });

  if (c.analogy) {
    const analogyText = getContentPlainText(c.analogy);
    WORDS.forEach((w) => {
      if (analogyText.includes(w)) {
        console.log(`- [${id}] analogy: '${w}'\n  문맥: "${analogyText}"`);
      }
    });
  }

  if (c.oneLineSummary) {
    WORDS.forEach((w) => {
      if (c.oneLineSummary.includes(w)) {
        console.log(`- [${id}] oneLineSummary: '${w}'\n  문맥: "${c.oneLineSummary}"`);
      }
    });
  }
}
