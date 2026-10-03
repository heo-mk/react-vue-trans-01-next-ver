import fs from 'fs';
import path from 'path';

const puppeteerPath = require.resolve('puppeteer', {
  paths: [require.resolve('@mermaid-js/mermaid-cli')],
});
const puppeteer = require(puppeteerPath);

const SCREENSHOT_DIR = path.join(process.cwd(), 'qa-screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  async function setDesktop() {
    await page.setViewport({ width: 1280, height: 950, deviceScaleFactor: 1 });
  }

  async function setMobile() {
    await page.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
  }

  async function scrollToPreIndex(preIdx: number) {
    await page.evaluate((idx) => {
      const pres = document.querySelectorAll('pre');
      if (pres[idx]) {
        // Find parent comparison container
        const parent = pres[idx].closest('.grid') || pres[idx];
        parent.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    }, preIdx);
  }

  console.log('📸 정확한 pre 인덱스 기반 스크린샷 캡처 시작...');

  // 1. k1-reactivity-code2-desktop.png: 반응성 개념 "실전 예제" (pres[2])
  {
    await setDesktop();
    await page.goto('http://localhost:3000/react-vue/reactivity-state', { waitUntil: 'networkidle0' });
    await scrollToPreIndex(2);
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'k1-reactivity-code2-desktop.png'),
    });
    console.log('✅ 캡처 완료: k1-reactivity-code2-desktop.png');
  }

  // 2. k2-global-code1-desktop.png: 전역 상태 첫 예제 (pres[0])
  {
    await setDesktop();
    await page.goto('http://localhost:3000/react-vue/global-state', { waitUntil: 'networkidle0' });
    await scrollToPreIndex(0);
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'k2-global-code1-desktop.png'),
    });
    console.log('✅ 캡처 완료: k2-global-code1-desktop.png');
  }

  // 3. k3-global-code1-mobile.png: 전역 상태 첫 예제 모바일 (pres[0])
  {
    await setMobile();
    await page.goto('http://localhost:3000/react-vue/global-state', { waitUntil: 'networkidle0' });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    console.log(`📱 [모바일 뷰포트] scrollWidth: ${scrollWidth}px, body scrollWidth: ${bodyWidth}px (Viewport: 375px)`);

    await scrollToPreIndex(0);
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'k3-global-code1-mobile.png'),
    });
    console.log('✅ 캡처 완료: k3-global-code1-mobile.png');
  }

  // 4. k4-global-code3-desktop.png: 전역 상태 "실전 예제"(관심 항목 persist, pres[4])
  {
    await setDesktop();
    await page.goto('http://localhost:3000/react-vue/global-state', { waitUntil: 'networkidle0' });
    await scrollToPreIndex(4);
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'k4-global-code3-desktop.png'),
    });
    console.log('✅ 캡처 완료: k4-global-code3-desktop.png');
  }

  // 5. k5-server-code4-desktop.png: 서버 상태 무한 스크롤 예제 (pres[6])
  {
    await setDesktop();
    await page.goto('http://localhost:3000/react-vue/server-state', { waitUntil: 'networkidle0' });
    await scrollToPreIndex(6);
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'k5-server-code4-desktop.png'),
    });
    console.log('✅ 캡처 완료: k5-server-code4-desktop.png');
  }

  // 6. k6-options-code2-desktop.png: Options → Composition "실전 예제" (pres[2])
  {
    await setDesktop();
    await page.goto('http://localhost:3000/vue2-vue3/options-to-composition', { waitUntil: 'networkidle0' });
    await scrollToPreIndex(2);
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'k6-options-code2-desktop.png'),
    });
    console.log('✅ 캡처 완료: k6-options-code2-desktop.png');
  }

  await browser.close();
  console.log('🎉 모든 캡처 작업 완료!');
}

capture().catch((err) => {
  console.error('캡처 중 오류 발생:', err);
  process.exit(1);
});
