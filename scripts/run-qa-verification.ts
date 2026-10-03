import fs from 'fs';
import path from 'path';

// Puppeteer resolve
const puppeteerPath = require.resolve('puppeteer', {
  paths: [require.resolve('@mermaid-js/mermaid-cli')],
});
const puppeteer = require(puppeteerPath);

const SCREENSHOT_DIR = path.join(process.cwd(), 'qa-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const PAGES = [
  { name: '홈', path: '/' },
  { name: '반응성 시스템', path: '/react-vue/reactivity-state' },
  { name: '전역 상태', path: '/react-vue/global-state' },
  { name: '서버 상태', path: '/react-vue/server-state' },
  { name: 'Options→Composition', path: '/vue2-vue3/options-to-composition' },
  { name: '렌더링 방식', path: '/nuxt-next/rendering-modes' },
];

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('🚀 QA 자동화 검증 스크립트 실행 시작...\n');

  // evaluate 내부에서 실행될 코드 (문자열 방식)
  const findBrokenWordsScript = (disableKeepAll: boolean) => `
    (() => {
      if (${disableKeepAll}) {
        document.body.style.wordBreak = 'normal';
      } else {
        document.body.style.wordBreak = '';
      }

      const brokenWords = [];

      const isExcluded = (node) => {
        let curr = node;
        while (curr && curr !== document.body) {
          if (curr.nodeType === Node.ELEMENT_NODE) {
            const tagName = curr.tagName.toLowerCase();
            if (['pre', 'code', 'svg', 'script', 'style', 'noscript'].includes(tagName)) {
              return true;
            }
            if (curr.classList && (curr.classList.contains('font-mono') || curr.classList.contains('card-scroll-area'))) {
              if (curr.closest('pre') || curr.querySelector('code')) return true;
            }
          }
          curr = curr.parentNode;
        }
        return false;
      };

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (isExcluded(node)) return NodeFilter.FILTER_REJECT;
            if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_SKIP;
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      let textNode = walker.nextNode();
      while (textNode) {
        const text = textNode.textContent || '';
        const wordRegex = /[^\\s]+/g;
        let match;
        while ((match = wordRegex.exec(text)) !== null) {
          const word = match[0];
          if (word.length < 2) continue;

          const start = match.index;
          const end = start + word.length;

          const range = document.createRange();
          try {
            range.setStart(textNode, start);
            range.setEnd(textNode, end);

            const rects = Array.from(range.getClientRects());
            if (rects.length > 1) {
              const tops = rects.map((r) => r.top);
              const minTop = Math.min(...tops);
              const maxTop = Math.max(...tops);
              const avgHeight = rects[0].height || 16;

              if (maxTop - minTop >= avgHeight * 0.5) {
                const parentText = textNode.parentElement ? textNode.parentElement.textContent.replace(/\\s+/g, ' ').trim() : text.replace(/\\s+/g, ' ').trim();
                brokenWords.push({
                  word,
                  parentSnippet: parentText.slice(0, 30),
                  rectsCount: rects.length,
                });
              }
            }
          } catch (e) {}
        }
        textNode = walker.nextNode();
      }

      return brokenWords;
    })()
  `;

  // 검사 1 & 검사 2 결과 수집
  console.log('================================================================');
  console.log('📊 [검사 1 & 2] 페이지별 줄바꿈 끊김 단어 검사 & 가로 스크롤 넘침 검사');
  console.log('================================================================\n');

  for (const p of PAGES) {
    const pageUrl = `http://localhost:3000${p.path}`;

    // 데스크톱 (1280px)
    const pageDesktop = await browser.newPage();
    await pageDesktop.setViewport({ width: 1280, height: 900 });
    await pageDesktop.goto(pageUrl, { waitUntil: 'networkidle0' });

    const brokenDesktopBefore: any[] = await pageDesktop.evaluate(findBrokenWordsScript(true));
    const brokenDesktopAfter: any[] = await pageDesktop.evaluate(findBrokenWordsScript(false));
    const scrollWidthDesktop: number = await pageDesktop.evaluate('document.documentElement.scrollWidth');
    const innerWidthDesktop: number = await pageDesktop.evaluate('window.innerWidth');

    await pageDesktop.close();

    // 모바일 (375px, deviceScaleFactor 2, isMobile true, hasTouch true)
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await pageMobile.goto(pageUrl, { waitUntil: 'networkidle0' });

    const brokenMobileBefore: any[] = await pageMobile.evaluate(findBrokenWordsScript(true));
    const brokenMobileAfter: any[] = await pageMobile.evaluate(findBrokenWordsScript(false));
    const scrollWidthMobile: number = await pageMobile.evaluate('document.documentElement.scrollWidth');
    const innerWidthMobile: number = await pageMobile.evaluate('window.innerWidth');

    console.log(`📌 페이지: ${p.name} (${p.path})`);
    console.log(`  [데스크톱 1280px]`);
    console.log(`    - scrollWidth: ${scrollWidthDesktop}px, innerWidth: ${innerWidthDesktop}px (가로 넘침: ${scrollWidthDesktop > innerWidthDesktop ? '⚠️ 발생' : '✅ 0 (정상)'})`);
    console.log(`    - 수정 전(keep-all 해제) 끊긴 단어: ${brokenDesktopBefore.length}건`);
    console.log(`    - 수정 후(keep-all 적용) 끊긴 단어: ${brokenDesktopAfter.length}건`);
    if (brokenDesktopAfter.length > 0) {
      console.log(`      목록:`, brokenDesktopAfter);
    }

    console.log(`  [모바일 375px]`);
    console.log(`    - scrollWidth: ${scrollWidthMobile}px, innerWidth: ${innerWidthMobile}px (가로 넘침: ${scrollWidthMobile > innerWidthMobile ? '⚠️ 발생' : '✅ 0 (정상)'})`);
    console.log(`    - 수정 전(keep-all 해제) 끊긴 단어: ${brokenMobileBefore.length}건`);
    if (brokenMobileBefore.length > 0) {
      console.log(`      수정 전 대표 끊김 단어 예시:`);
      brokenMobileBefore.slice(0, 4).forEach((b, i) => {
        console.log(`        ${i + 1}) 단어: "${b.word}" | 문장 앞 30자: "${b.parentSnippet}"`);
      });
    }
    console.log(`    - 수정 후(keep-all 적용) 끊긴 단어: ${brokenMobileAfter.length}건`);
    if (brokenMobileAfter.length > 0) {
      console.log(`      수정 후 목록:`, brokenMobileAfter);
    }
    console.log('----------------------------------------------------------------');

    await pageMobile.close();
  }

  // 3. 검사 3) 모바일 구조도 겹침 검사
  console.log('\n================================================================');
  console.log('📊 [검사 3] 모바일(375px) 구조도 확대 버튼 vs SVG 텍스트 요소 겹침 검사');
  console.log('================================================================\n');

  for (const p of PAGES.filter((p) => p.path !== '/')) {
    const pageMobile = await browser.newPage();
    await pageMobile.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    await pageMobile.goto(`http://localhost:3000${p.path}`, { waitUntil: 'networkidle0' });

    const overlapResult: any = await pageMobile.evaluate(`
      (() => {
        const trigger = document.querySelector('div[role="button"][aria-haspopup="dialog"]');
        if (!trigger) return { hasDiagram: false, overlapCount: 0, textCount: 0, overlaps: [] };

        const badge = trigger.querySelector('.absolute.top-3.right-3');
        if (!badge) return { hasDiagram: false, overlapCount: 0, textCount: 0, overlaps: [] };

        const badgeRect = badge.getBoundingClientRect();
        
        // 모바일 활성 SVG (block sm:hidden 내부 SVG 또는 직계 SVG)
        const visibleSvgContainer = trigger.querySelector('.block.sm\\\\:hidden') || trigger;
        const svg = visibleSvgContainer.querySelector('svg');
        if (!svg) return { hasDiagram: false, overlapCount: 0, textCount: 0, overlaps: [] };

        // SVG 내의 모든 라벨 요소 탐색 (foreignObject, span, div, text, tspan)
        const textElements = Array.from(svg.querySelectorAll('foreignObject, text, tspan, .nodeLabel, .edgeLabel, p, span, div'))
          .filter(el => {
            const hasText = el.textContent && el.textContent.trim().length > 0;
            const isLeafOrContainer = el.children.length === 0 || el.tagName.toLowerCase() === 'foreignobject';
            return hasText && isLeafOrContainer;
          });

        const overlaps = [];

        for (const el of textElements) {
          const textRect = el.getBoundingClientRect();
          if (textRect.width === 0 || textRect.height === 0) continue;

          // BoundingBox 겹침 판정 (패딩/마진 포함)
          const isOverlap = !(
            badgeRect.right <= textRect.left ||
            badgeRect.left >= textRect.right ||
            badgeRect.bottom <= textRect.top ||
            badgeRect.top >= textRect.bottom
          );

          if (isOverlap) {
            overlaps.push({
              text: el.textContent ? el.textContent.trim() : 'unknown',
              textRect: { top: textRect.top, bottom: textRect.bottom, left: textRect.left, right: textRect.right },
              badgeRect: { top: badgeRect.top, bottom: badgeRect.bottom, left: badgeRect.left, right: badgeRect.right }
            });
          }
        }

        return {
          hasDiagram: true,
          overlapCount: overlaps.length,
          textCount: textElements.length,
          overlaps,
          badgeRect: { top: badgeRect.top, bottom: badgeRect.bottom, height: badgeRect.height },
          firstTextTop: textElements.length > 0 ? Math.min(...textElements.map(e => e.getBoundingClientRect().top).filter(t => t > 0)) : null
        };
      })()
    `);

    console.log(`📌 페이지: ${p.name} (${p.path})`);
    if (!overlapResult.hasDiagram) {
      console.log(`  다이어그램 없음`);
    } else {
      console.log(`  - 측정한 SVG 텍스트 요소 개수: ${overlapResult.textCount}개`);
      console.log(`  - 버튼(하단: ${overlapResult.badgeRect.bottom.toFixed(1)}px) vs 첫 텍스트 요소(상단: ${overlapResult.firstTextTop ? overlapResult.firstTextTop.toFixed(1) + 'px' : 'N/A'})`);
      console.log(`  - 버튼과 SVG 텍스트 겹침 건수: ${overlapResult.overlapCount}건`);
      if (overlapResult.overlapCount === 0) {
        console.log(`  - 판정: ✅ 겹침 0건 (정상 배치 확인)`);
      } else {
        console.log(`  - ⚠️ 겹친 텍스트 목록:`, overlapResult.overlaps);
      }
    }
    console.log('----------------------------------------------------------------');
    await pageMobile.close();
  }

  // 4. 스크린샷 캡처 (요구사항 E)
  console.log('\n================================================================');
  console.log('📸 [스크린샷 캡처] qa-screenshots/ 생성');
  console.log('================================================================\n');

  // j1-global-summary-mobile.png: 전역 상태 첫 코드 예제의 "핵심 차이 요약" 박스 전체 (모바일)
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3000/react-vue/global-state', { waitUntil: 'networkidle0' });
    const scrollWidth = await page.evaluate('document.documentElement.scrollWidth');
    console.log(`[j1 캡처 전] global-state 모바일 document.documentElement.scrollWidth = ${scrollWidth}px`);

    const summaryBox = await page.$('div.divide-y.divide-\\[var\\(--border-subtle\\)\\]');
    if (summaryBox) {
      const parentHandle = await page.evaluateHandle((el: any) => el.closest('.overflow-hidden.rounded-xl') || el, summaryBox);
      const parentEl = parentHandle.asElement();
      if (parentEl) {
        await page.evaluate((el: any) => el.scrollIntoView({ block: 'center' }), parentEl);
        await parentEl.screenshot({ path: path.join(SCREENSHOT_DIR, 'j1-global-summary-mobile.png') });
        console.log('✅ 캡처 완료: j1-global-summary-mobile.png');
      }
    }
    await page.close();
  }

  // j2-server-note-desktop.png, j3-server-note-mobile.png: 서버 상태 "참고 사항" 박스
  {
    // Desktop
    const pageD = await browser.newPage();
    await pageD.setViewport({ width: 1280, height: 900 });
    await pageD.goto('http://localhost:3000/react-vue/server-state', { waitUntil: 'networkidle0' });
    const scrollWidthD = await pageD.evaluate('document.documentElement.scrollWidth');
    console.log(`[j2 캡처 전] server-state 데스크톱 document.documentElement.scrollWidth = ${scrollWidthD}px`);

    const noteBoxD = await pageD.$('div.bg-blue-500\\/5');
    if (noteBoxD) {
      await pageD.evaluate((el: any) => el.scrollIntoView({ block: 'center' }), noteBoxD);
      await noteBoxD.screenshot({ path: path.join(SCREENSHOT_DIR, 'j2-server-note-desktop.png') });
      console.log('✅ 캡처 완료: j2-server-note-desktop.png');
    }
    await pageD.close();

    // Mobile
    const pageM = await browser.newPage();
    await pageM.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pageM.goto('http://localhost:3000/react-vue/server-state', { waitUntil: 'networkidle0' });
    const scrollWidthM = await pageM.evaluate('document.documentElement.scrollWidth');
    console.log(`[j3 캡처 전] server-state 모바일 document.documentElement.scrollWidth = ${scrollWidthM}px`);

    const noteBoxM = await pageM.$('div.bg-blue-500\\/5');
    if (noteBoxM) {
      await pageM.evaluate((el: any) => el.scrollIntoView({ block: 'center' }), noteBoxM);
      await noteBoxM.screenshot({ path: path.join(SCREENSHOT_DIR, 'j3-server-note-mobile.png') });
      console.log('✅ 캡처 완료: j3-server-note-mobile.png');
    }
    await pageM.close();
  }

  // j4-rendering-diagram-desktop.png, j5-rendering-diagram-mobile.png: 렌더링 개념 다이어그램 (수정 후)
  {
    // Desktop
    const pageD = await browser.newPage();
    await pageD.setViewport({ width: 1280, height: 900 });
    await pageD.goto('http://localhost:3000/nuxt-next/rendering-modes', { waitUntil: 'networkidle0' });
    const scrollWidthD = await pageD.evaluate('document.documentElement.scrollWidth');
    console.log(`[j4 캡처 전] rendering-modes 데스크톱 document.documentElement.scrollWidth = ${scrollWidthD}px`);

    const diagramD = await pageD.$('figure');
    if (diagramD) {
      await pageD.evaluate((el: any) => el.scrollIntoView({ block: 'center' }), diagramD);
      await diagramD.screenshot({ path: path.join(SCREENSHOT_DIR, 'j4-rendering-diagram-desktop.png') });
      console.log('✅ 캡처 완료: j4-rendering-diagram-desktop.png');
    }
    await pageD.close();

    // Mobile
    const pageM = await browser.newPage();
    await pageM.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pageM.goto('http://localhost:3000/nuxt-next/rendering-modes', { waitUntil: 'networkidle0' });
    const scrollWidthM = await pageM.evaluate('document.documentElement.scrollWidth');
    console.log(`[j5 캡처 전] rendering-modes 모바일 document.documentElement.scrollWidth = ${scrollWidthM}px`);

    const diagramM = await pageM.$('figure');
    if (diagramM) {
      await pageM.evaluate((el: any) => el.scrollIntoView({ block: 'center' }), diagramM);
      await diagramM.screenshot({ path: path.join(SCREENSHOT_DIR, 'j5-rendering-diagram-mobile.png') });
      console.log('✅ 캡처 완료: j5-rendering-diagram-mobile.png');
    }
    await pageM.close();
  }

  // j6-global-diagram-mobile.png: 전역 상태 구조도 (모바일, 버튼과 제목이 겹치지 않는지)
  {
    const pageM = await browser.newPage();
    await pageM.setViewport({ width: 375, height: 812, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pageM.goto('http://localhost:3000/react-vue/global-state', { waitUntil: 'networkidle0' });
    const scrollWidthM = await pageM.evaluate('document.documentElement.scrollWidth');
    console.log(`[j6 캡처 전] global-state 모바일 document.documentElement.scrollWidth = ${scrollWidthM}px`);

    const diagramM = await pageM.$('figure');
    if (diagramM) {
      await pageM.evaluate((el: any) => el.scrollIntoView({ block: 'center' }), diagramM);
      await diagramM.screenshot({ path: path.join(SCREENSHOT_DIR, 'j6-global-diagram-mobile.png') });
      console.log('✅ 캡처 완료: j6-global-diagram-mobile.png');
    }
    await pageM.close();
  }

  await browser.close();
  console.log('\n🎉 모든 QA 검증 및 스크린샷 캡처 완료!');
}

run().catch((err) => {
  console.error('QA 검증 실패:', err);
  process.exit(1);
});
