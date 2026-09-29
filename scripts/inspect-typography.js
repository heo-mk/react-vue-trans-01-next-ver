const path = require('node:path');
const fs = require('node:fs');

const puppeteerPath = require.resolve('puppeteer', {
  paths: [require.resolve('@mermaid-js/mermaid-cli')],
});
const puppeteer = require(puppeteerPath);

async function inspectTypography() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const pagesToCheck = [
    { name: '홈 화면', path: '/' },
    { name: '사고 전환의 출발점 (reactivity-state)', path: '/react-vue/reactivity-state' },
    { name: '전역 상태 관리 생태계 (global-state)', path: '/react-vue/global-state' },
    { name: '서버 상태 관리 (server-state)', path: '/react-vue/server-state' },
    { name: 'Options → Composition API (options-to-composition)', path: '/vue2-vue3/options-to-composition' },
    { name: '풀스택 메타 프레임워크 (rendering-modes)', path: '/nuxt-next/rendering-modes' },
  ];

  const widths = [1280, 768, 375];

  const page = await browser.newPage();

  const allHeadings = [];
  const allSplitDetails = [];
  const sectionSplitCounts = {
    '파인만 핵심 요약': { 1280: 0, 768: 0, 375: 0 },
    '직관적 비유': { 1280: 0, 768: 0, 375: 0 },
    '핵심 비교표 (셀)': { 1280: 0, 768: 0, 375: 0 },
    '함정 문답 (Q&A)': { 1280: 0, 768: 0, 375: 0 },
    '목록 / 카드 / 기타 본문': { 1280: 0, 768: 0, 375: 0 },
  };

  const clientScript = `
    (() => {
      function getRenderedLines(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
              if (node.parentElement && node.parentElement.closest('pre, code, svg, figcaption')) return NodeFilter.FILTER_REJECT;
              return NodeFilter.FILTER_ACCEPT;
            }
          }
        );
        while (walker.nextNode()) textNodes.push(walker.currentNode);

        const chars = [];
        for (const node of textNodes) {
          const str = node.textContent || '';
          for (let i = 0; i < str.length; i++) {
            const range = document.createRange();
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getBoundingClientRect();
            if (rect.width > 0 || rect.height > 0) {
              chars.push({ char: str[i], y: Math.round(rect.top), x: rect.left });
            }
          }
        }

        if (chars.length === 0) return [];

        let currentLineY = chars[0].y;
        let currentLineChars = [];
        const rawLines = [];

        for (const ch of chars) {
          if (Math.abs(ch.y - currentLineY) > 5) {
            rawLines.push(currentLineChars.join('').trim());
            currentLineChars = [ch.char];
            currentLineY = ch.y;
          } else {
            currentLineChars.push(ch.char);
          }
        }
        if (currentLineChars.length > 0) {
          rawLines.push(currentLineChars.join('').trim());
        }

        return rawLines.filter(function(l) { return l.length > 0; });
      }

      const headings = [];
      const headingEls = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
      const techTerms = ['Context API', 'Options API', 'Composition API', 'Next.js', 'Nuxt 3', 'Vue 2', 'Vue 3', 'React 18+', 'Vue 3.4+', 'Redux Toolkit', 'TanStack Query', 'Vue Query'];

      for (const el of headingEls) {
        if (el.closest('pre, code, svg, figcaption')) continue;
        const text = (el.textContent || '').replace(/\\s+/g, ' ').trim();
        if (!text) continue;
        const renderedLines = getRenderedLines(el);
        
        let splitsWord = false;
        for (let i = 0; i < renderedLines.length - 1; i++) {
          const line1 = renderedLines[i];
          const line2 = renderedLines[i + 1];
          const wordsInText = text.split(/\\s+/);
          for (const w of wordsInText) {
            if (w.length >= 2) {
              for (let cut = 1; cut < w.length; cut++) {
                const part1 = w.slice(0, cut);
                const part2 = w.slice(cut);
                if (line1.endsWith(part1) && line2.startsWith(part2)) {
                  splitsWord = true;
                }
              }
            }
          }

          for (const term of techTerms) {
            if (text.includes(term)) {
              for (let cut = 1; cut < term.length; cut++) {
                const part1 = term.slice(0, cut).trimEnd();
                const part2 = term.slice(cut).trimStart();
                if (line1.endsWith(part1) && line2.startsWith(part2)) {
                  splitsWord = true;
                }
              }
            }
          }
        }

        headings.push({
          tag: el.tagName.toLowerCase(),
          text: text,
          lines: renderedLines,
          splitsWord: splitsWord
        });
      }

      const splitIssues = [];

      function checkElementTextSplits(element, sectionName) {
        const lines = getRenderedLines(element);
        const fullText = (element.textContent || '').replace(/\\s+/g, ' ').trim();
        const words = fullText.split(/\\s+/);

        for (let i = 0; i < lines.length - 1; i++) {
          const line1 = lines[i];
          const line2 = lines[i + 1];

          for (const w of words) {
            if (w.length >= 2) {
              for (let cut = 1; cut < w.length; cut++) {
                const part1 = w.slice(0, cut);
                const part2 = w.slice(cut);
                if (line1.endsWith(part1) && line2.startsWith(part2)) {
                  splitIssues.push({
                    section: sectionName,
                    brokenWord: w,
                    lineEnd: part1,
                    lineStart: part2,
                    fullSnippet: '...' + line1.slice(-15) + ' / ' + line2.slice(0, 15) + '...'
                  });
                }
              }
            }
          }

          for (const term of techTerms) {
            if (fullText.includes(term)) {
              for (let cut = 1; cut < term.length; cut++) {
                const part1 = term.slice(0, cut).trimEnd();
                const part2 = term.slice(cut).trimStart();
                if (line1.endsWith(part1) && line2.startsWith(part2)) {
                  splitIssues.push({
                    section: sectionName,
                    brokenWord: term,
                    lineEnd: part1,
                    lineStart: part2,
                    fullSnippet: '...' + line1.slice(-15) + ' / ' + line2.slice(0, 15) + '...'
                  });
                }
              }
            }
          }
        }
      }

      const feynmanEls = Array.from(document.querySelectorAll('div, p')).filter(function(el) {
        return (el.previousElementSibling && el.previousElementSibling.textContent.includes('파인만 핵심 요약')) ||
               (el.textContent && el.textContent.includes('💡 파인만 핵심 요약'));
      });
      feynmanEls.forEach(function(el) {
        const p = el.querySelector('p') || el;
        if (p && p.tagName === 'P') checkElementTextSplits(p, '파인만 핵심 요약');
      });

      const analogyEls = Array.from(document.querySelectorAll('p')).filter(function(p) {
        return p.parentElement && p.parentElement.textContent.includes('🎭 직관적 비유');
      });
      analogyEls.forEach(function(p) {
        checkElementTextSplits(p, '직관적 비유');
      });

      const tableCells = Array.from(document.querySelectorAll('table td, table th'));
      tableCells.forEach(function(cell) {
        checkElementTextSplits(cell, '핵심 비교표 (셀)');
      });

      const pitfallEls = Array.from(document.querySelectorAll('h4, p')).filter(function(el) {
        return el.closest('.space-y-4') && (el.tagName === 'H4' || el.tagName === 'P') && !el.textContent.includes('학습 & 실전 면접 함정');
      });
      pitfallEls.forEach(function(el) {
        checkElementTextSplits(el, '함정 문답 (Q&A)');
      });

      const listItems = Array.from(document.querySelectorAll('ul li, main section p, .grid p'));
      listItems.forEach(function(el) {
        if (!el.closest('table, .space-y-4, header, nav, footer')) {
          checkElementTextSplits(el, '목록 / 카드 / 기타 본문');
        }
      });

      return { headings: headings, splitIssues: splitIssues };
    })()
  `;

  for (const pageInfo of pagesToCheck) {
    const url = `http://localhost:3000${pageInfo.path}`;
    await page.goto(url, { waitUntil: 'networkidle0' });

    const widthResults = {};

    for (const width of widths) {
      await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });
      await new Promise((r) => setTimeout(r, 200));

      const analysis = await page.evaluate(clientScript);
      widthResults[width] = analysis;
    }

    const headings1280 = widthResults[1280].headings;
    const headings768 = widthResults[768].headings;
    const headings375 = widthResults[375].headings;

    for (let i = 0; i < headings1280.length; i++) {
      const h1280 = headings1280[i];
      const h768 = headings768[i] || h1280;
      const h375 = headings375[i] || h1280;

      allHeadings.push({
        page: pageInfo.name,
        tag: h1280.tag,
        text: h1280.text,
        lines1280: h1280.lines.length,
        lines768: h768.lines.length,
        lines375: h375.lines.length,
        breaks1280: h1280.lines,
        breaks768: h768.lines,
        breaks375: h375.lines,
        splitsWord1280: h1280.splitsWord,
        splitsWord768: h768.splitsWord,
        splitsWord375: h375.splitsWord,
      });
    }

    for (const width of widths) {
      const issues = widthResults[width].splitIssues;
      for (const iss of issues) {
        allSplitDetails.push({
          page: pageInfo.name,
          section: iss.section,
          width,
          brokenWord: iss.brokenWord,
          lineEnd: iss.lineEnd,
          lineStart: iss.lineStart,
          fullSnippet: iss.fullSnippet,
        });
        if (sectionSplitCounts[iss.section]) {
          sectionSplitCounts[iss.section][width]++;
        } else {
          sectionSplitCounts['목록 / 카드 / 기타 본문'][width]++;
        }
      }
    }
  }

  await browser.close();

  const reportPath = path.resolve(process.cwd(), 'scripts/inspection-result.json');
  fs.writeFileSync(reportPath, JSON.stringify({ allHeadings, allSplitDetails, sectionSplitCounts }, null, 2), 'utf-8');
  console.log('Inspection finished! Written to scripts/inspection-result.json');
}

inspectTypography().catch((e) => {
  console.error(e);
  process.exit(1);
});
