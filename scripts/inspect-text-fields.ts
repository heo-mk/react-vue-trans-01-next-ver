import fs from 'fs';
import { allConcepts } from '../content/index';
import { getContentPlainText } from '../content/schema';

function countSentences(text: string): number {
  if (!text) return 0;
  const clean = text.trim();
  const sentences = clean.split(/[.!?]+(?:\s+|$)/).filter((s) => s.trim().length > 0);
  return sentences.length;
}

interface ItemAnalysis {
  concept: string;
  field: string;
  length: number;
  sentenceCount: number;
  text: string;
  question?: string;
  selectedFormat: string;
  reason: string;
}

const results: ItemAnalysis[] = [];

for (const c of allConcepts) {
  const conceptName = `${c.cardTitle || c.title} (${c.slug})`;

  if (c.oneLineSummary) {
    const len = c.oneLineSummary.length;
    const sc = countSentences(c.oneLineSummary);
    results.push({
      concept: conceptName,
      field: 'oneLineSummary',
      length: len,
      sentenceCount: sc,
      text: c.oneLineSummary,
      selectedFormat: '산문 유지',
      reason: 'oneLineSummary 규칙 (파인만 요약은 2문장 이하면 그대로 유지)',
    });
  }

  if (c.analogy) {
    const text = getContentPlainText(c.analogy);
    const len = text.length;
    const sc = countSentences(text);
    results.push({
      concept: conceptName,
      field: 'analogy',
      length: len,
      sentenceCount: sc,
      text,
      selectedFormat: typeof c.analogy === 'string' ? '산문' : '글머리 목록',
      reason: '두 대상 비교 구조 (Next.js vs Nuxt, React vs Vue 등)',
    });
  }

  if (c.comparisonNote) {
    const len = c.comparisonNote.length;
    const sc = countSentences(c.comparisonNote);
    results.push({
      concept: conceptName,
      field: 'comparisonNote',
      length: len,
      sentenceCount: sc,
      text: c.comparisonNote,
      selectedFormat: '산문 유지',
      reason: '비교표 상단 참고 문구',
    });
  }

  c.pitfalls.forEach((p, idx) => {
    const text = getContentPlainText(p.answer);
    const len = text.length;
    const sc = countSentences(text);
    const isStructured = typeof p.answer !== 'string';
    const listType = isStructured ? (p.answer as any).listType : 'none';

    results.push({
      concept: conceptName,
      field: `pitfalls[${idx + 1}] (${p.question.slice(0, 20)}...)`,
      length: len,
      sentenceCount: sc,
      text,
      question: p.question,
      selectedFormat: isStructured ? (listType === 'ordered' ? '번호 목록' : '글머리 목록') : '산문 유지',
      reason: isStructured ? '구조화 목록 적용됨' : '산문 유지',
    });
  });
}

fs.writeFileSync('scripts/text-fields-report.json', JSON.stringify(results, null, 2), 'utf-8');
console.log(`Generated ${results.length} items`);
