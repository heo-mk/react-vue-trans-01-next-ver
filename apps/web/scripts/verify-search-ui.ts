import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import net from 'node:net';
import { spawn, execSync, ChildProcess } from 'node:child_process';
import { allConcepts } from 'api/content';
import { searchConcepts } from 'api/content/search';

const puppeteerPath = require.resolve('puppeteer', {
  paths: [require.resolve('@mermaid-js/mermaid-cli')],
});
const puppeteer = require(puppeteerPath);

const screenshotDir = path.join(os.tmpdir(), 'rvt-search-ui');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

function waitForPort(port: number, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.once('connect', () => {
        socket.destroy();
        resolve();
      });
      socket.once('timeout', () => {
        socket.destroy();
        retry();
      });
      socket.once('error', () => {
        socket.destroy();
        retry();
      });
      socket.connect(port, '127.0.0.1');
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timeout waiting for port ${port}`));
      } else {
        setTimeout(check, 250);
      }
    };
    check();
  });
}

function waitForPortToClose(port: number, timeoutMs = 10000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = async () => {
      const inUse = await isPortInUse(port);
      if (!inUse) {
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        resolve();
      } else {
        setTimeout(check, 250);
      }
    };
    check();
  });
}

interface ScenarioResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'WEAK';
  measurement: any;
  notes?: string;
}

const results: ScenarioResult[] = [];

function recordResult(result: ScenarioResult) {
  results.push(result);
  const statusColor =
    result.status === 'PASS'
      ? '\x1b[32mPASS\x1b[0m'
      : result.status === 'WEAK'
        ? '\x1b[33mWEAK\x1b[0m'
        : '\x1b[31mFAIL\x1b[0m';
  console.log(`[${statusColor}] ${result.id}: ${result.name}`);
  if (result.notes) {
    console.log(`       ${result.notes}`);
  }
}

interface NetworkTracker {
  postCount: number;
  optionsCount: number;
  postQueries: string[];
  optionsObserved: boolean;
  failedRequests: { url: string; errorText: string }[];
}

function attachNetworkTracker(page: any): NetworkTracker {
  const tracker: NetworkTracker = {
    postCount: 0,
    optionsCount: 0,
    postQueries: [],
    optionsObserved: false,
    failedRequests: [],
  };

  page.on('request', (req: any) => {
    const url = req.url();
    if (url.startsWith('http://localhost:4000')) {
      const method = req.method();
      if (method === 'OPTIONS') {
        tracker.optionsCount += 1;
        tracker.optionsObserved = true;
      } else if (method === 'POST') {
        tracker.postCount += 1;
        try {
          const postData = req.postData();
          if (postData) {
            const body = JSON.parse(postData);
            if (body && body.variables && typeof body.variables.q === 'string') {
              tracker.postQueries.push(body.variables.q);
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  });

  page.on('requestfailed', (req: any) => {
    const url = req.url();
    if (url.startsWith('http://localhost:4000')) {
      tracker.failedRequests.push({
        url,
        errorText: req.failure()?.errorText || '',
      });
    }
  });

  return tracker;
}

function getListeningPid(port: number): number | null {
  try {
    const out = execSync(
      `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess"`,
      { encoding: 'utf-8' }
    ).trim();
    const pid = parseInt(out, 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

async function run() {
  console.log('=== Starting Navbar Search UI Verifications ===');

  // 프로세스 안전 규칙: 시작 전 포트 3000, 4000 점유 확인
  const port3000Busy = await isPortInUse(3000);
  const port4000Busy = await isPortInUse(4000);
  if (port3000Busy || port4000Busy) {
    console.error(
      `[오류] 시작 시점에 포트가 이미 사용 중입니다 (3000: ${port3000Busy ? '사용 중' : '비어 있음'}, 4000: ${port4000Busy ? '사용 중' : '비어 있음'}). 기존 프로세스를 건드리지 않고 즉시 종료합니다.`
    );
    process.exit(1);
  }

  let apiProc: ChildProcess | null = null;
  let webProc: ChildProcess | null = null;
  let apiWorkerPid: number | null = null;
  let webWorkerPid: number | null = null;
  let browser: any = null;

  const killByPid = (pid: number | undefined | null) => {
    if (!pid) return;
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
    } catch {}
  };

  const cleanup = async () => {
    if (browser) {
      try {
        await browser.close();
      } catch {}
      browser = null;
    }
    if (webWorkerPid) {
      killByPid(webWorkerPid);
      webWorkerPid = null;
    }
    if (webProc?.pid) {
      killByPid(webProc.pid);
      webProc = null;
    }
    if (apiWorkerPid) {
      killByPid(apiWorkerPid);
      apiWorkerPid = null;
    }
    if (apiProc?.pid) {
      killByPid(apiProc.pid);
      apiProc = null;
    }
    await waitForPortToClose(3000);
    await waitForPortToClose(4000);
  };

  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(1);
  });
  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(1);
  });

  try {
    const apiDir = path.resolve(__dirname, '../../../apps/api');
    const webDir = path.resolve(__dirname, '..');
    const tsxCli = path.join(path.dirname(require.resolve('tsx', { paths: [apiDir] })), 'cli.mjs');
    const nextBin = require.resolve('next/dist/bin/next', { paths: [webDir] });

    console.log('[verify-search-ui] 서버 프로세스 기동 중 (직접 spawn & PID 추적)...');
    apiProc = spawn(process.execPath, [tsxCli, 'src/index.ts'], {
      cwd: apiDir,
      stdio: 'ignore',
    });
    console.log(`[verify-search-ui] API 서버 기동 (PID: ${apiProc.pid})`);

    webProc = spawn(process.execPath, [nextBin, 'dev'], {
      cwd: webDir,
      stdio: 'ignore',
    });
    console.log(`[verify-search-ui] Next.js 웹 서버 기동 (PID: ${webProc.pid})`);

    await Promise.all([waitForPort(4000), waitForPort(3000)]);
    apiWorkerPid = getListeningPid(4000);
    webWorkerPid = getListeningPid(3000);
    console.log(
      `[verify-search-ui] 서버 준비 완료 (4000 [PID: ${apiWorkerPid}], 3000 [PID: ${webWorkerPid}] 포트 열림).`
    );

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // 0. Warm-up
    console.log('Warming up Next.js dev server at http://localhost:3000...');
    const warmUpPage = await browser.newPage();
    await warmUpPage.setViewport({ width: 1280, height: 800 });
    await warmUpPage.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 60000 });
    await warmUpPage.waitForSelector('input[aria-label="개념 검색"]', { timeout: 30000 });
    await warmUpPage.close();
    console.log('Warm-up complete.\n');

    // ========================================================
    // Viewport 1280x800 Scenarios
    // ========================================================
    console.log('--- Running Scenarios on Viewport 1280x800 ---');

    // S1. 입력만으로는 요청이 가지 않는다
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await new Promise((r) => setTimeout(r, 1500));

      const passed = tracker.postCount === 0;
      recordResult({
        id: 'S1',
        name: '입력만으로는 요청이 가지 않는다',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { postCount: tracker.postCount, optionsCount: tracker.optionsCount },
        notes: `POST 요청 ${tracker.postCount}건 (기대값: 0건)`,
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S1_fail.png') });
      }
      await page.close();
    }

    // S2. Enter 로 제출
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.keyboard.press('Enter');

      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });
      const headingText = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const items = await page.$$eval('[data-testid="search-result-item"]', (nodes: any[]) =>
        nodes.map((node) => node.textContent?.trim())
      );

      const expectedConcepts = searchConcepts(allConcepts, 'Zustand');
      const expectedCount = expectedConcepts.length; // 2건
      const postOk = tracker.postCount === 1 && tracker.postQueries[0] === 'Zustand';
      const headingOk = headingText === `'Zustand' 검색 결과 ${expectedCount}건`;
      const itemsOk = items.length === expectedCount;

      const passed = postOk && headingOk && itemsOk;
      recordResult({
        id: 'S2',
        name: 'Enter 로 제출',
        status: passed ? 'PASS' : 'FAIL',
        measurement: {
          postCount: tracker.postCount,
          query: tracker.postQueries[0],
          headingText,
          itemsCount: items.length,
        },
        notes: `POST: ${tracker.postCount}건, 헤더: "${headingText}", 항목 수: ${items.length}개`,
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S2_fail.png') });
      }
      await page.close();
    }

    // S3. 검색 버튼 클릭으로 제출
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      const submitBtn = 'button[aria-label="검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.click(submitBtn);

      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });
      const headingText = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const itemsCount = await page.$$eval('[data-testid="search-result-item"]', (nodes: any[]) => nodes.length);

      const passed =
        tracker.postCount === 1 &&
        tracker.postQueries[0] === 'Zustand' &&
        headingText === "'Zustand' 검색 결과 2건" &&
        itemsCount === 2;

      recordResult({
        id: 'S3',
        name: '검색 버튼 클릭으로 제출',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { postCount: tracker.postCount, headingText, itemsCount },
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S3_fail.png') });
      }
      await page.close();
    }

    // S4. 추천 검색어
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.waitForSelector('[data-testid="search-dropdown"]', { timeout: 5000 });

      // 추천 검색어 버튼 3개 및 가시성 검사
      const recButtonsData = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('[data-testid="search-recommend"]'));
        return buttons.map((b) => {
          const rect = b.getBoundingClientRect();
          const el = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          return {
            text: b.textContent?.trim(),
            visible: el === b || b.contains(el),
          };
        });
      });

      const initialKeywords = recButtonsData.map((b: { text: string }) => b.text);
      const allVisible = recButtonsData.every((b: { visible: boolean }) => b.visible);
      const buttonsMatch =
        initialKeywords.length === 3 &&
        initialKeywords.includes('useState') &&
        initialKeywords.includes('ref') &&
        initialKeywords.includes('RSC');

      // 'ref' 클릭
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('[data-testid="search-recommend"]'));
        const refBtn = btns.find((b) => b.textContent?.trim() === 'ref');
        (refBtn as HTMLButtonElement)?.click();
      });

      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });
      const headingText = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const inputValue = await page.$eval(inputSelector, (el: any) => el.value);

      const expectedRefConcepts = searchConcepts(allConcepts, 'ref');
      const expectedRefCount = expectedRefConcepts.length; // 5건

      const passed =
        buttonsMatch &&
        allVisible &&
        inputValue === 'ref' &&
        tracker.postCount === 1 &&
        tracker.postQueries[0] === 'ref' &&
        headingText === `'ref' 검색 결과 ${expectedRefCount}건`;

      recordResult({
        id: 'S4',
        name: '추천 검색어 가시성 및 클릭 제출',
        status: passed ? 'PASS' : 'FAIL',
        measurement: {
          recButtonsData,
          inputValue,
          postCount: tracker.postCount,
          headingText,
        },
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S4_fail.png') });
      }
      await page.close();
    }

    // S5. 빈 검색어
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.waitForSelector('[data-testid="search-dropdown"]', { timeout: 5000 });

      // 빈 검색어 Enter
      await page.keyboard.press('Enter');
      await new Promise((r) => setTimeout(r, 600));

      // 공백만 입력 후 Enter
      await page.type(inputSelector, '   ');
      await page.keyboard.press('Enter');
      await new Promise((r) => setTimeout(r, 600));

      const recCount = await page.$$eval('[data-testid="search-recommend"]', (nodes: any[]) => nodes.length);
      const passed = tracker.postCount === 0 && recCount === 3;

      recordResult({
        id: 'S5',
        name: '빈 검색어 / 공백 제출 무시',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { postCount: tracker.postCount, recButtonsCount: recCount },
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S5_fail.png') });
      }
      await page.close();
    }

    // S6. 제출 뒤 입력을 고쳐도 결과 유지
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });

      const headingBefore = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const countBefore = await page.$$eval('[data-testid="search-result-item"]', (nodes: any[]) => nodes.length);
      const postBefore = tracker.postCount;

      // 입력창 내용을 'abc'로 수정 (Enter 누르지 않음)
      await page.click(inputSelector);
      await page.type(inputSelector, 'abc');
      await new Promise((r) => setTimeout(r, 800));

      const headingAfter = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const countAfter = await page.$$eval('[data-testid="search-result-item"]', (nodes: any[]) => nodes.length);
      const postAfter = tracker.postCount;

      const passed =
        postBefore === 1 &&
        postAfter === 1 &&
        headingBefore === headingAfter &&
        countBefore === countAfter;

      recordResult({
        id: 'S6',
        name: '제출 뒤 입력 수정 시 결과 및 요청 불변',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { headingBefore, headingAfter, postBefore, postAfter },
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S6_fail.png') });
      }
      await page.close();
    }

    // S7. 닫기 (Escape, 바깥 클릭, Tab 이탈, mousedown 유지)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);

      // (a) Escape 로 닫히고 입력값 유지, 재클릭 시 다시 노출
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.waitForSelector('[data-testid="search-dropdown"]');
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 400));
      const closedOnEscape = await page.evaluate(() => !document.querySelector('[data-testid="search-dropdown"]'));
      const valOnEscape = await page.$eval(inputSelector, (el: any) => el.value);
      // Escape 후 초점 해제 후 다시 입력창 클릭 시 재노출 확인
      await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
      await new Promise((r) => setTimeout(r, 200));
      await page.click(inputSelector);
      await new Promise((r) => setTimeout(r, 400));
      const reopenedOnClick = await page.evaluate(() => !!document.querySelector('[data-testid="search-dropdown"]'));

      // (b) 바깥(본문) 클릭 시 닫힘
      await page.mouse.click(100, 300);
      await new Promise((r) => setTimeout(r, 400));
      const closedOnOutsideClick = await page.evaluate(() => !document.querySelector('[data-testid="search-dropdown"]'));

      // (c) Tab 반복으로 검색 영역 밖으로 나갈 때 닫힘
      await page.click(inputSelector);
      await new Promise((r) => setTimeout(r, 400));
      let tabCount = 0;
      let focusedTagAfterExit = '';
      while (tabCount < 10) {
        await page.keyboard.press('Tab');
        tabCount++;
        await new Promise((r) => setTimeout(r, 200));
        const isOpen = await page.evaluate(() => !!document.querySelector('[data-testid="search-dropdown"]'));
        if (!isOpen) {
          focusedTagAfterExit = await page.evaluate(() => {
            const a = document.activeElement;
            return a ? `${a.tagName}[${(a as HTMLElement).getAttribute('aria-label') || a.className.slice(0, 20)}]` : 'null';
          });
          break;
        }
      }

      // (d) 추천 버튼 위에서 mousedown 유지 시 닫히지 않음
      await page.click(inputSelector);
      await page.waitForSelector('[data-testid="search-dropdown"]');
      await new Promise((r) => setTimeout(r, 400));
      const recBtnPos = await page.evaluate(() => {
        const btn = document.querySelector('[data-testid="search-recommend"]');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      });
      let heldOpen = false;
      if (recBtnPos) {
        await page.mouse.move(recBtnPos.x, recBtnPos.y);
        await page.mouse.down();
        await new Promise((r) => setTimeout(r, 500));
        heldOpen = await page.evaluate(() => !!document.querySelector('[data-testid="search-dropdown"]'));
        await page.mouse.up();
        await new Promise((r) => setTimeout(r, 300));
      }

      console.log('       [S7 Debug]:', {
        closedOnEscape,
        valOnEscape,
        reopenedOnClick,
        closedOnOutsideClick,
        tabCount,
        heldOpen,
      });

      const passed =
        closedOnEscape &&
        valOnEscape === 'Zustand' &&
        reopenedOnClick &&
        closedOnOutsideClick &&
        tabCount > 0 &&
        tabCount < 10 &&
        heldOpen;

      recordResult({
        id: 'S7',
        name: '드롭다운 닫기 동작 (Escape, 바깥클릭, Tab, mousedown 유지)',
        status: passed ? 'PASS' : 'FAIL',
        measurement: {
          closedOnEscape,
          valOnEscape,
          reopenedOnClick,
          closedOnOutsideClick,
          tabCount,
          focusedTagAfterExit,
          heldOpen,
        },
        notes: `Tab 횟수: ${tabCount}회 (초점 대상: ${focusedTagAfterExit})`,
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S7_fail.png') });
      }
      await page.close();
    }

    // S8. ✕ 버튼 및 진행 중 요청 취소
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });

      // ✕ 버튼 클릭
      const clearBtn = 'button[aria-label="입력값 지우기"]';
      await page.click(clearBtn);
      await new Promise((r) => setTimeout(r, 500));

      const inputEmpty = await page.$eval(inputSelector, (el: any) => el.value === '');
      const headingGone = await page.evaluate(() => !document.querySelector('[data-testid="search-heading"]'));
      const isInputFocused = await page.evaluate(() => document.activeElement?.getAttribute('aria-label') === '개념 검색');

      // 지연 요청 중 ✕ 누를 때의 취소 검증
      await page.setRequestInterception(true);
      let abortSeen = false;
      const delayedRequests: any[] = [];
      page.on('request', (req: any) => {
        if (req.url().startsWith('http://localhost:4000') && req.method() === 'POST') {
          delayedRequests.push(req);
          setTimeout(() => {
            req.continue().catch(() => {});
          }, 1500);
        } else {
          req.continue().catch(() => {});
        }
      });
      page.on('requestfailed', (req: any) => {
        if (req.url().startsWith('http://localhost:4000')) {
          abortSeen = true;
        }
      });

      await page.type(inputSelector, 'ref');
      await page.keyboard.press('Enter');
      // 제출 직후 ✕ 클릭
      await new Promise((r) => setTimeout(r, 100));
      await page.click(clearBtn);
      await new Promise((r) => setTimeout(r, 2000));

      const headingAfterDelayed = await page.evaluate(() => !document.querySelector('[data-testid="search-heading"]'));
      const passed = inputEmpty && headingGone && isInputFocused && abortSeen && headingAfterDelayed;

      recordResult({
        id: 'S8',
        name: '✕ 버튼 초기화 및 진행 중인 요청 abort 취소',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { inputEmpty, headingGone, isInputFocused, abortSeen, headingAfterDelayed },
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S8_fail.png') });
      }
      await page.close();
    }

    // S9. 결과 선택
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="search-result-item"]', { timeout: 10000 });

      // 첫 번째 항목 클릭
      const firstItem = await page.$('[data-testid="search-result-item"]');
      await firstItem.click();

      await page.waitForFunction(() => window.location.pathname !== '/');
      const finalUrl = page.url();
      const dropdownClosed = await page.evaluate(() => !document.querySelector('[data-testid="search-dropdown"]'));
      const inputCleared = await page.$eval(inputSelector, (el: any) => el.value === '');

      const passed =
        finalUrl.includes('/react-vue/global-state') &&
        dropdownClosed &&
        inputCleared;

      recordResult({
        id: 'S9',
        name: '결과 항목 클릭 시 상세 이동 및 드롭다운 닫힘',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { finalUrl, dropdownClosed, inputCleared },
        notes: `이동된 URL: ${finalUrl}`,
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S9_fail.png') });
      }
      await page.close();
    }

    // S10. 응답 순서 (Race Condition 방지)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      await page.setRequestInterception(true);
      let continueErrors = 0;
      let firstRequestAborted = false;

      page.on('request', (req: any) => {
        if (req.url().startsWith('http://localhost:4000') && req.method() === 'POST') {
          let q = '';
          try {
            const body = JSON.parse(req.postData() || '{}');
            q = body.variables?.q || '';
          } catch {}

          if (q === 'Zustand') {
            setTimeout(() => {
              req.continue().catch((err: any) => {
                continueErrors++;
              });
            }, 1500);
          } else {
            req.continue().catch((err: any) => {
              continueErrors++;
            });
          }
        } else {
          req.continue().catch((err: any) => {
            continueErrors++;
          });
        }
      });

      page.on('requestfailed', (req: any) => {
        if (req.url().startsWith('http://localhost:4000')) {
          firstRequestAborted = true;
        }
      });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);

      // 'Zustand' 제출
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.keyboard.press('Enter');

      // 응답 오기 전 즉시 비우고 'RSC' 입력 제출
      await new Promise((r) => setTimeout(r, 100));
      const clearBtn = 'button[aria-label="입력값 지우기"]';
      await page.click(clearBtn);
      await page.type(inputSelector, 'RSC');
      await page.keyboard.press('Enter');

      // 첫 요청의 지연 응답이 도착할 때까지 대기
      await new Promise((r) => setTimeout(r, 2200));

      const heading = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const items = await page.$$eval('[data-testid="search-result-item"]', (nodes: any[]) =>
        nodes.map((n) => n.textContent?.trim())
      );

      const expectedRsc = searchConcepts(allConcepts, 'RSC');
      const expectedCount = expectedRsc.length; // 1건
      const hasZustand = items.some((item: string) => item.includes('global-state') || item.includes('전역 상태'));

      const passed =
        heading === `'RSC' 검색 결과 ${expectedCount}건` &&
        items.length === expectedCount &&
        !hasZustand;

      recordResult({
        id: 'S10',
        name: '응답 순서 보장 (느린 이전 응답 무시 및 최신 응답 유지)',
        status: passed ? 'PASS' : 'FAIL',
        measurement: {
          heading,
          itemsCount: items.length,
          hasZustand,
          firstRequestAborted,
          continueErrors,
        },
        notes: `첫 요청 abort 확인: ${firstRequestAborted}, continue 에러 수: ${continueErrors}`,
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S10_fail.png') });
      }
      await page.close();
    }

    // S11. 오류 문구 3가지 (api 끄지 않고 가로채기로 처리)
    {
      const cases = [
        {
          subId: 'a',
          name: '네트워크 연결 실패 (abort)',
          handler: (req: any) => req.abort('failed'),
          expected: '검색 서버에 연결할 수 없습니다. 네트워크 연결 상태를 확인해 주세요.',
        },
        {
          subId: 'b',
          name: '서버 500 오류 응답',
          handler: (req: any) =>
            req.respond({
              status: 500,
              contentType: 'application/json',
              headers: { 'Access-Control-Allow-Origin': '*' }, // CORS 차단 방지 목적
              body: JSON.stringify({ message: 'Internal Server Error' }),
            }),
          expected: '검색 서버 응답에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        },
        {
          subId: 'c',
          name: 'GraphQL 200 오류 배열 응답',
          handler: (req: any) =>
            req.respond({
              status: 200,
              contentType: 'application/json',
              headers: { 'Access-Control-Allow-Origin': '*' }, // CORS 차단 방지 목적
              body: JSON.stringify({ errors: [{ message: 'GraphQL query error' }] }),
            }),
          expected: '검색 결과를 가져오는 중 오류가 발생했습니다.',
        },
      ];

      for (const c of cases) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

        await page.setRequestInterception(true);
        page.on('request', (req: any) => {
          if (req.url().startsWith('http://localhost:4000') && req.method() === 'POST') {
            c.handler(req);
          } else {
            req.continue().catch(() => {});
          }
        });

        const inputSelector = 'input[aria-label="개념 검색"]';
        await page.waitForSelector(inputSelector);
        await page.click(inputSelector);
        await page.type(inputSelector, 'Zustand');
        await page.keyboard.press('Enter');

        await page.waitForFunction(
          (expectedMsg: string) => {
            const el = document.querySelector('[data-testid="search-status"]');
            return el && el.textContent?.trim() === expectedMsg;
          },
          { timeout: 10000 },
          c.expected
        );
        const statusText = await page.$eval('[data-testid="search-status"]', (el: any) => el.textContent?.trim());
        const bodyText = await page.evaluate(() => document.body.textContent || '');

        const hasExpected = statusText === c.expected;
        const noInternalLeak =
          !bodyText.includes('localhost:4000') &&
          !bodyText.includes('apps/api가 켜져 있는지');

        const passed = hasExpected && noInternalLeak;
        recordResult({
          id: `S11-${c.subId}`,
          name: `오류 문구: ${c.name}`,
          status: passed ? 'PASS' : 'FAIL',
          measurement: { statusText, noInternalLeak },
          notes: `표시 문구: "${statusText}"`,
        });
        if (!passed) {
          await page.screenshot({ path: path.join(screenshotDir, `S11_${c.subId}_fail.png`) });
        }
        await page.close();
      }
    }

    // S12. 화면 크기와 다크 모드 (1280x800)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.waitForSelector('[data-testid="search-dropdown"]');

      const initialMeasurement = await page.evaluate(() => {
        const input = document.querySelector('input[aria-label="개념 검색"]');
        const dd = document.querySelector('[data-testid="search-dropdown"]');
        const iRect = input?.getBoundingClientRect();
        const dRect = dd?.getBoundingClientRect();
        const s = dd ? window.getComputedStyle(dd) : null;
        return {
          viewportWidth: window.innerWidth,
          inputRect: iRect ? { left: iRect.left, right: iRect.right, width: iRect.width } : null,
          dropdownRect: dRect ? { left: dRect.left, right: dRect.right, width: dRect.width } : null,
          bgLight: s?.backgroundColor,
          withinViewport: dRect ? dRect.left >= 8 && dRect.right <= window.innerWidth - 8 : false,
        };
      });

      // 다크 모드 전환 (ThemeToggle 클릭)
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('header button'));
        const toggleBtn = btns.find((b) => b.getAttribute('aria-label')?.includes('모드로 전환'));
        (toggleBtn as HTMLElement | undefined)?.click();
      });
      await new Promise((r) => setTimeout(r, 400));

      const bgDark = await page.evaluate(() => {
        const dd = document.querySelector('[data-testid="search-dropdown"]');
        return dd ? window.getComputedStyle(dd).backgroundColor : null;
      });

      const colorsDiffer = initialMeasurement.bgLight !== bgDark;
      const passed = initialMeasurement.withinViewport && colorsDiffer;

      recordResult({
        id: 'S12-1280',
        name: '화면 크기(1280x800) 및 다크 모드 배경색 전환',
        status: passed ? 'PASS' : 'FAIL',
        measurement: {
          initialMeasurement,
          bgDark,
          colorsDiffer,
        },
        notes: `라이트 배경: ${initialMeasurement.bgLight} → 다크 배경: ${bgDark}`,
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S12_1280_fail.png') });
      }
      await page.close();
    }

    // S13. 영문이 아닌 검색어 (한글 검색어 전달 확인용)
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);

      // page.type 은 글자를 직접 타이핑하여 IME 조합 단계 없이 전달됨
      await page.type(inputSelector, '상태');
      await page.keyboard.press('Enter');

      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });
      const heading = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());

      const expectedKorean = searchConcepts(allConcepts, '상태');
      const expectedCount = expectedKorean.length;

      const passed =
        tracker.postCount === 1 &&
        tracker.postQueries[0] === '상태' &&
        heading === `'상태' 검색 결과 ${expectedCount}건`;

      recordResult({
        id: 'S13',
        name: '영문 외 검색어 (한글 검색어 정상 전달 및 결과 건수 확인)',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { postCount: tracker.postCount, query: tracker.postQueries[0], heading },
        notes: '참고: 이 시나리오는 한글 검색어가 API까지 정상 전달되는지 확인하는 것이며 IME 조합 동작 검증이 아님.',
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S13_fail.png') });
      }
      await page.close();
    }

    // S14. 한글 조합(IME) 시도
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);

      // 이벤트 모니터링 등록 (문자열 스크립트로 전달하여 esbuild __name 주입 방지)
      await page.evaluate(`
        window.__imeEvents = [];
        var input = document.querySelector('input[aria-label="개념 검색"]');
        if (input) {
          ['compositionstart', 'compositionupdate', 'compositionend'].forEach(function(ev) {
            input.addEventListener(ev, function(e) {
              window.__imeEvents.push({ type: ev, detail: { data: e.data } });
            });
          });
          input.addEventListener('keydown', function(e) {
            window.__imeEvents.push({
              type: 'keydown',
              detail: { key: e.key, keyCode: e.keyCode, isComposing: e.isComposing }
            });
          });
          input.addEventListener('beforeinput', function(e) {
            window.__imeEvents.push({
              type: 'beforeinput',
              detail: { inputType: e.inputType, data: e.data }
            });
          });
        }
      `);

      // CDP 세션 생성 및 IME 세팅
      let cdpSuccess = false;
      const cdp = await page.createCDPSession();
      try {
        await cdp.send('Input.imeSetComposition', {
          text: '상태',
          selectionStart: 2,
          selectionEnd: 2,
        });
        cdpSuccess = true;
      } catch (e: any) {
        console.log('[S14] CDP imeSetComposition exception:', e.message);
      }

      const postDuringComposition = tracker.postCount;

      // 조합 중 Enter 전달 시도
      try {
        await cdp.send('Input.dispatchKeyEvent', {
          type: 'rawKeyDown',
          key: 'Enter',
          code: 'Enter',
          windowsVirtualKeyCode: 13,
        });
        await new Promise((r) => setTimeout(r, 400));
      } catch (e: any) {
        console.log('[S14] CDP dispatchKeyEvent exception:', e.message);
      }

      const postAfterCompEnter = tracker.postCount;

      // 조합 확정 및 확정 후 Enter 전송
      try {
        await cdp.send('Input.insertText', { text: '상태' });
        await new Promise((r) => setTimeout(r, 300));
        await page.keyboard.press('Enter');
        await new Promise((r) => setTimeout(r, 1200));
      } catch (e: any) {
        console.log('[S14] CDP insertText exception:', e.message);
      }

      const postAfterCommitEnter = tracker.postCount;
      const recordedEvents = await page.evaluate(() => (window as any).__imeEvents || []);

      const compositionObserved = recordedEvents.some(
        (ev: any) => ev.type === 'compositionstart' || ev.detail?.isComposing === true
      );

      let status: 'PASS' | 'WEAK' | 'FAIL' = 'WEAK';
      let classificationReason = '';

      if (!compositionObserved) {
        status = 'WEAK';
        classificationReason = 'Headless Chrome 환경에서 compositionstart/isComposing 이벤트를 생성하지 못함 (근거로 쓸 수 없음).';
      } else {
        const compEnterBlocked = postAfterCompEnter - postDuringComposition === 0;
        const commitEnterSent = postAfterCommitEnter - postAfterCompEnter === 1;
        if (compEnterBlocked && commitEnterSent) {
          status = 'PASS';
          classificationReason = '조합 중 Enter에서 POST 차단 및 확정 후 Enter에서 정상 1건 전송 확인.';
        } else {
          status = 'FAIL';
          classificationReason = `조합 중 POST: ${postAfterCompEnter - postDuringComposition}건, 확정 후 POST: ${postAfterCommitEnter - postAfterCompEnter}건`;
        }
      }

      recordResult({
        id: 'S14',
        name: '한글 조합(IME) 상태 및 Enter 억제 검증',
        status,
        measurement: {
          cdpSuccess,
          compositionObserved,
          postDuringComposition,
          postAfterCompEnter,
          postAfterCommitEnter,
          eventsSample: recordedEvents.slice(0, 10),
        },
        notes: `판정: ${status} (${classificationReason})`,
      });
      await page.close();
    }

    // ========================================================
    // Viewport 375x667 Scenarios (S2, S3, S12)
    // ========================================================
    console.log('\n--- Running Mobile Scenarios on Viewport 375x667 (S2, S3, S12) ---');

    // S2-375
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 667 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.keyboard.press('Enter');

      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });
      const headingText = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const itemsCount = await page.$$eval('[data-testid="search-result-item"]', (nodes: any[]) => nodes.length);

      const passed =
        tracker.postCount === 1 &&
        tracker.postQueries[0] === 'Zustand' &&
        headingText === "'Zustand' 검색 결과 2건" &&
        itemsCount === 2;

      recordResult({
        id: 'S2-375',
        name: '모바일 375x667: Enter 로 제출',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { postCount: tracker.postCount, headingText, itemsCount },
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S2_375_fail.png') });
      }
      await page.close();
    }

    // S3-375
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 667 });
      const tracker = attachNetworkTracker(page);
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      const submitBtn = 'button[aria-label="검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.type(inputSelector, 'Zustand');
      await page.click(submitBtn);

      await page.waitForSelector('[data-testid="search-heading"]', { timeout: 10000 });
      const headingText = await page.$eval('[data-testid="search-heading"]', (el: any) => el.textContent?.trim());
      const itemsCount = await page.$$eval('[data-testid="search-result-item"]', (nodes: any[]) => nodes.length);

      const passed =
        tracker.postCount === 1 &&
        tracker.postQueries[0] === 'Zustand' &&
        headingText === "'Zustand' 검색 결과 2건" &&
        itemsCount === 2;

      recordResult({
        id: 'S3-375',
        name: '모바일 375x667: 검색 버튼 클릭으로 제출',
        status: passed ? 'PASS' : 'FAIL',
        measurement: { postCount: tracker.postCount, headingText, itemsCount },
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S3_375_fail.png') });
      }
      await page.close();
    }

    // S12-375
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 375, height: 667 });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

      const inputSelector = 'input[aria-label="개념 검색"]';
      await page.waitForSelector(inputSelector);
      await page.click(inputSelector);
      await page.waitForSelector('[data-testid="search-dropdown"]');

      const measurement = await page.evaluate(() => {
        const input = document.querySelector('input[aria-label="개념 검색"]');
        const dd = document.querySelector('[data-testid="search-dropdown"]');
        const clear = document.querySelector('button[aria-label="입력값 지우기"]');
        const submit = document.querySelector('button[aria-label="검색"]');

        const iRect = input?.getBoundingClientRect();
        const dRect = dd?.getBoundingClientRect();
        const cRect = clear?.getBoundingClientRect();
        const sRect = submit?.getBoundingClientRect();

        return {
          viewportWidth: window.innerWidth,
          inputRect: iRect ? { left: iRect.left, right: iRect.right, width: iRect.width } : null,
          dropdownRect: dRect ? { left: dRect.left, right: dRect.right, width: dRect.width } : null,
          submitRect: sRect ? { left: sRect.left, right: sRect.right, width: sRect.width } : null,
          dropdownWithinViewport: dRect ? dRect.left >= 8 && dRect.right <= window.innerWidth - 8 : false,
        };
      });

      const passed = measurement.dropdownWithinViewport;

      recordResult({
        id: 'S12-375',
        name: '모바일 375x667: 뷰포트 내 수용 및 정렬',
        status: passed ? 'PASS' : 'FAIL',
        measurement,
        notes: `드롭다운: ${measurement.dropdownRect?.left}px ~ ${measurement.dropdownRect?.right}px (뷰포트: ${measurement.viewportWidth}px, 8px 여백)`,
      });
      if (!passed) {
        await page.screenshot({ path: path.join(screenshotDir, 'S12_375_fail.png') });
      }
      await page.close();
    }

    // 최종 스크린샷 캡처
    const finalPage = await browser.newPage();
    await finalPage.setViewport({ width: 1280, height: 800 });
    await finalPage.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await finalPage.click('input[aria-label="개념 검색"]');
    await new Promise((r) => setTimeout(r, 400));
    await finalPage.screenshot({ path: path.join(screenshotDir, 'final_verification.png') });
    await finalPage.close();

    console.log('\n=== Verification Summary ===');
    const hasFail = results.some((r) => r.status === 'FAIL');
    console.table(
      results.map((r) => ({
        ID: r.id,
        Name: r.name,
        Status: r.status,
      }))
    );

    if (hasFail) {
      console.error('\x1b[31mOne or more scenarios FAILED.\x1b[0m');
      process.exitCode = 1;
    } else {
      console.log('\x1b[32mAll scenarios PASSED or WEAK.\x1b[0m');
      process.exitCode = 0;
    }
  } catch (err) {
    console.error('Unexpected error during verification:', err);
    process.exitCode = 1;
  } finally {
    console.log('[verify-search-ui] 서버 프로세스 정리 중 (PID 기준 taskkill /T /F)...');
    await cleanup();
    const final3000 = await isPortInUse(3000);
    const final4000 = await isPortInUse(4000);
    console.log(
      `[verify-search-ui] 최종 포트 상태 확인: 3000=${final3000 ? '점유 중' : '비어 있음'}, 4000=${final4000 ? '점유 중' : '비어 있음'}`
    );
  }
}

run();
