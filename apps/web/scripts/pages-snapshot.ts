import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TARGET_URLS = [
  '/',
  '/react-vue/reactivity-state',
  '/react-vue/global-state',
  '/react-vue/server-state',
  '/vue2-vue3/options-to-composition',
  '/nuxt-next/rendering-modes',
];

const NOT_FOUND_URLS = ['/react-vue/zzz', '/nuxt-next/zzz'];

const BASE_URL = 'http://localhost:3000';

interface PageSnapshot {
  url: string;
  title: string;
  metaDescription: string;
  visibleText: string;
  hrefs: string[];
  normalizedHtml: string;
}

function cleanHtml(rawHtml: string): string {
  return rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractMetaDescription(html: string): string {
  const match1 = html.match(
    /<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
  );
  if (match1) return match1[1].trim();
  const match2 = html.match(
    /<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i
  );
  return match2 ? match2[1].trim() : '';
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function extractVisibleText(html: string): string {
  const stripped = html.replace(/<[^>]+>/g, ' ');
  return decodeHtmlEntities(stripped).replace(/\s+/g, ' ').trim();
}

function extractHrefs(html: string): string[] {
  const hrefs: string[] = [];
  const regex = /<a\b[^>]*href=["']([^"']*)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1].trim();
    if (href && !href.startsWith('/_next/')) {
      hrefs.push(href);
    }
  }
  return Array.from(new Set(hrefs)).sort();
}

function getSafeFilename(url: string): string {
  if (url === '/') return 'root.json';
  return (
    url
      .replace(/^\//, '')
      .replace(/[\/\\]/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '') + '.json'
  );
}

async function run() {
  const label = process.argv[2];
  if (!label || (label !== 'before' && label !== 'after')) {
    console.error('사용법: tsx scripts/pages-snapshot.ts <before|after>');
    process.exit(1);
  }

  const snapshotDir = path.join(os.tmpdir(), 'rvt-snapshots', label);
  fs.mkdirSync(snapshotDir, { recursive: true });

  console.log(`📸 [pages-snapshot] '${label}' 스냅샷 캡처 시작: ${BASE_URL}\n`);

  // 1. 200 주소 확인 및 스냅샷 수집
  const currentSnapshots = new Map<string, PageSnapshot>();

  for (const urlPath of TARGET_URLS) {
    const fullUrl = `${BASE_URL}${urlPath}`;
    const res = await fetch(fullUrl);
    if (res.status !== 200) {
      console.error(
        `❌ [200 실패] ${urlPath} 에 대해 상태 코드 ${res.status} 수신 (기대값: 200)`
      );
      process.exit(1);
    }

    const rawHtml = await res.text();
    const normalizedHtml = cleanHtml(rawHtml);
    const title = extractTitle(rawHtml);
    const metaDescription = extractMetaDescription(rawHtml);
    const visibleText = extractVisibleText(normalizedHtml);
    const hrefs = extractHrefs(rawHtml);

    const snapshot: PageSnapshot = {
      url: urlPath,
      title,
      metaDescription,
      visibleText,
      hrefs,
      normalizedHtml,
    };

    currentSnapshots.set(urlPath, snapshot);

    const filePath = path.join(snapshotDir, getSafeFilename(urlPath));
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
    console.log(`  ✓ [200 정상] ${urlPath} -> ${filePath}`);
  }

  // 2. 404 주소 확인
  console.log('\n2. 404 미존재 주소 검증:');
  for (const urlPath of NOT_FOUND_URLS) {
    const fullUrl = `${BASE_URL}${urlPath}`;
    const res = await fetch(fullUrl);
    if (res.status !== 404) {
      console.error(
        `❌ [404 실패] ${urlPath} 에 대해 상태 코드 ${res.status} 수신 (기대값: 404)`
      );
      process.exit(1);
    }
    console.log(`  ✓ [404 정상] ${urlPath} -> 404 Not Found 확인`);
  }

  // 3. 'after' 라벨인 경우 'before'와 비교
  if (label === 'after') {
    const beforeDir = path.join(os.tmpdir(), 'rvt-snapshots', 'before');
    if (!fs.existsSync(beforeDir)) {
      console.warn(
        `⚠️ 'before' 스냅샷 디렉터리가 없어 비교를 건너뜁니다: ${beforeDir}`
      );
      return;
    }

    console.log('\n3. before vs after 스냅샷 전수 비교 검증:');
    let hasDifference = false;

    for (const urlPath of TARGET_URLS) {
      const beforeFile = path.join(beforeDir, getSafeFilename(urlPath));
      if (!fs.existsSync(beforeFile)) {
        console.error(`❌ before 스냅샷 파일 없음: ${beforeFile}`);
        hasDifference = true;
        continue;
      }

      const before: PageSnapshot = JSON.parse(
        fs.readFileSync(beforeFile, 'utf-8')
      );
      const after = currentSnapshots.get(urlPath)!;

      let pageDiff = false;

      // (1) title 비교
      if (before.title !== after.title) {
        console.error(`  ❌ [${urlPath}] title 불일치:`);
        console.error(`     before: "${before.title}"`);
        console.error(`     after:  "${after.title}"`);
        pageDiff = true;
      }

      // (2) meta description 비교
      if (before.metaDescription !== after.metaDescription) {
        console.error(`  ❌ [${urlPath}] metaDescription 불일치:`);
        console.error(`     before: "${before.metaDescription}"`);
        console.error(`     after:  "${after.metaDescription}"`);
        pageDiff = true;
      }

      // (3) visible text 비교
      if (before.visibleText !== after.visibleText) {
        console.error(`  ❌ [${urlPath}] 보이는 글자(visibleText) 불일치:`);
        console.error(
          `     before (길이 ${before.visibleText.length}): "${before.visibleText.slice(0, 100)}..."`
        );
        console.error(
          `     after  (길이 ${after.visibleText.length}): "${after.visibleText.slice(0, 100)}..."`
        );
        pageDiff = true;
      }

      // (4) href 목록 비교
      const beforeHrefsStr = JSON.stringify(before.hrefs);
      const afterHrefsStr = JSON.stringify(after.hrefs);
      if (beforeHrefsStr !== afterHrefsStr) {
        console.error(`  ❌ [${urlPath}] href 목록 불일치:`);
        console.error(`     before: ${beforeHrefsStr}`);
        console.error(`     after:  ${afterHrefsStr}`);
        pageDiff = true;
      }

      // 전체 HTML 차이 (출력만 하고 실패로 보지 않음)
      if (before.normalizedHtml !== after.normalizedHtml) {
        console.log(
          `  ℹ️ [${urlPath}] 전체 HTML 내부 구조에 미세 차이 있음 (속성 순서/ID 등, 비치명적)`
        );
      }

      if (pageDiff) {
        hasDifference = true;
      } else {
        console.log(
          `  ✓ [${urlPath}] title, metaDescription, visibleText, hrefs 100% 일치`
        );
      }
    }

    if (hasDifference) {
      console.error(
        '\n❌ [검증 실패] before와 after 스냅샷 간에 불일치가 감지되었습니다.'
      );
      process.exit(1);
    } else {
      console.log(
        '\n🎉 [스냅샷 검증 성공] 6개 페이지 모두 before와 완벽하게 일치합니다!'
      );
    }
  }

  console.log(`\n✨ 스냅샷 완료 (${label})\n`);
}

run().catch((err) => {
  console.error('스냅샷 실행 오류:', err);
  process.exit(1);
});
