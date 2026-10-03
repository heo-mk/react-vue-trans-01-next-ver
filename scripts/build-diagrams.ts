import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Phase 1에서 정의한 CSS 변수와 고정 Hex 색상 간의 매핑표
 * (규칙: 스크립트 상단 상수로 관리)
 */
export const HEX_TO_CSS_VAR_MAP: Record<string, string> = {
  // Vue colors
  '#ecfdf5': 'var(--diagram-vue-bg)',
  '#10b981': 'var(--diagram-vue-border)',
  '#065f46': 'var(--diagram-vue-text)',
  '#eef7d9': 'var(--diagram-vue-bg)',
  '#7fa33a': 'var(--diagram-vue-border)',
  '#2f3d13': 'var(--diagram-vue-text)',

  // React colors
  '#f0f9ff': 'var(--diagram-react-bg)',
  '#0ea5e9': 'var(--diagram-react-border)',
  '#0369a1': 'var(--diagram-react-text)',
  '#ede1fb': 'var(--diagram-react-bg)',
  '#8a5bb0': 'var(--diagram-react-border)',
  '#3a2449': 'var(--diagram-react-text)',
  '#cffafe': 'var(--diagram-react-bg)',
  '#06b6d4': 'var(--diagram-react-border)',
  '#164e63': 'var(--diagram-react-text)',

  // Warn colors
  '#fffbeb': 'var(--diagram-warn-bg)',
  '#f59e0b': 'var(--diagram-warn-border)',
  '#b45309': 'var(--diagram-warn-text)',

  // Ok colors
  '#f0fdf4': 'var(--diagram-ok-bg)',
  '#22c55e': 'var(--diagram-ok-border)',
  '#15803d': 'var(--diagram-ok-text)',

  // Subgraph & Cluster defaults
  '#ffffde': 'var(--diagram-neutral-1)',
  '#aaaa33': 'var(--diagram-neutral-3)',
};

export const DIAGRAM_ALT_TEXTS: Record<string, string> = {
  'reactivity-diagram':
    'Vue는 Proxy가 자동으로 감시하고, React는 setter 호출로 변경을 알린다.',
  'reactivity-diagram-vertical':
    'Vue는 Proxy가 자동으로 감시하고, React는 setter 호출로 변경을 알린다. (모바일 세로형)',
  'composition-migration-diagram':
    'Vue 2 Options API 분산 구조에서 Vue 3 Composition API 관심사 응집 구조로의 마이그레이션 흐름도',
  'composition-migration-diagram-vertical':
    'Vue 2 Options API 분산 구조에서 Vue 3 Composition API 관심사 응집 구조로의 마이그레이션 흐름도 (모바일 세로형)',
  'rendering-modes-diagram':
    'Nuxt 3 유니버설 하이드레이션과 Next.js App Router RSC 렌더링 모델 비교도',
  'rendering-modes-diagram-vertical':
    'Nuxt 3 유니버설 하이드레이션과 Next.js App Router RSC 렌더링 모델 비교도 (모바일 세로형)',
  'global-state-diagram':
    'React와 Vue의 클라이언트/서버 전역 상태 분업 아키텍처 비교도',
  'global-state-diagram-vertical':
    'React와 Vue의 클라이언트/서버 전역 상태 분업 아키텍처 비교도 (모바일 세로형)',
  'server-state-diagram':
    'TanStack Query 낙관적 갱신 및 롤백 실행 흐름도',
  'server-state-diagram-vertical':
    'TanStack Query 낙관적 갱신 및 롤백 실행 흐름도 (모바일 세로형)',
};

const DIAGRAMS_SRC_DIR = path.resolve(process.cwd(), 'content/diagrams');
const PUBLIC_OUTPUT_DIR = path.resolve(process.cwd(), 'public/diagrams');
const MANIFEST_OUTPUT_PATH = path.resolve(
  process.cwd(),
  'content/diagrams-manifest.json'
);
const PUPPETEER_CONFIG_PATH = path.resolve(
  process.cwd(),
  'puppeteer-config.json'
);

function postProcessSvg(svgContent: string, diagramId: string): string {
  let processed = svgContent;

  // Hex 색상을 CSS 변수로 치환 (대소문자 무관)
  for (const [hex, cssVar] of Object.entries(HEX_TO_CSS_VAR_MAP)) {
    const regex = new RegExp(hex, 'gi');
    processed = processed.replace(regex, cssVar);
  }

  // 텍스트 및 기본 라인 색상 후처리 (노드 기본 선 및 텍스트)
  // Mermaid 기본 라인 및 라벨에 다크모드 대응 변수 적용
  processed = processed.replace(
    /class="label" style="([^"]*)"/g,
    'class="label" style="$1; color: var(--diagram-text);"'
  );

  // 클러스터(subgraph) 및 엣지 라벨, 화살표 다크모드/라이트모드 CSS 변수 완벽 연동
  const clusterOverrides = `
    .cluster rect { fill: var(--diagram-neutral-1) !important; stroke: var(--diagram-neutral-3) !important; }
    .cluster text, .cluster span, .cluster .nodeLabel { fill: var(--diagram-text) !important; color: var(--diagram-text) !important; }
    .cluster-label span p { color: var(--diagram-text) !important; }
    .edgeLabel { background-color: var(--diagram-neutral-1) !important; color: var(--diagram-text) !important; }
    .edgeLabel p, .edgeLabel span { color: var(--diagram-text) !important; background-color: transparent !important; }
    .labelBkg { background-color: var(--diagram-neutral-1) !important; }
    .edgePaths .path, .flowchart-link { stroke: var(--diagram-line) !important; }
    .marker, .arrowMarkerPath, .arrowheadPath { fill: var(--diagram-line) !important; stroke: var(--diagram-line) !important; }
  </style>`;
  processed = processed.replace('</style>', `${clusterOverrides}`);

  // 접근성 (role="img", aria-label, <title>) 주입
  const altText = DIAGRAM_ALT_TEXTS[diagramId] || '실행 모델 구조도';
  processed = processed.replace(
    /<svg\b([^>]*)>/,
    `<svg$1 role="img" aria-label="${altText}"><title>${altText}</title>`
  );

  return processed;
}

async function buildDiagrams() {
  console.log('🚀 [Mermaid → SVG] 빌드 파이프라인 시작...');

  if (!fs.existsSync(DIAGRAMS_SRC_DIR)) {
    console.error(
      `❌ 다이어그램 소스 디렉토리를 찾을 수 없습니다: ${DIAGRAMS_SRC_DIR}`
    );
    process.exit(1);
  }

  if (!fs.existsSync(PUBLIC_OUTPUT_DIR)) {
    fs.mkdirSync(PUBLIC_OUTPUT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(DIAGRAMS_SRC_DIR)
    .filter((f) => f.endsWith('.mmd'));

  if (files.length === 0) {
    console.log('⚠️ 변환할 .mmd 파일이 없습니다.');
    return;
  }

  const manifest: Record<string, string> = {};

  for (const file of files) {
    const diagramId = path.basename(file, '.mmd');
    const inputPath = path.join(DIAGRAMS_SRC_DIR, file);
    const outputPath = path.join(PUBLIC_OUTPUT_DIR, `${diagramId}.svg`);

    console.log(`🔨 변환 중: ${file} → ${diagramId}.svg`);

    try {
      const puppeteerFlag = fs.existsSync(PUPPETEER_CONFIG_PATH)
        ? `-p "${PUPPETEER_CONFIG_PATH}"`
        : '';

      const svgId = `diag-${diagramId}`;

      // mermaid-cli (mmdc) 실행 (-I 로 고유 SVG ID 지정)
      execSync(
        `pnpm exec mmdc ${puppeteerFlag} -I "${svgId}" -i "${inputPath}" -o "${outputPath}" -b transparent`,
        {
          stdio: 'pipe',
        }
      );

      // 생성된 SVG 읽기 및 색상 CSS 변수 치환 후처리
      const rawSvg = fs.readFileSync(outputPath, 'utf-8');
      const processedSvg = postProcessSvg(rawSvg, diagramId);

      // 후처리된 SVG 덮어쓰기
      fs.writeFileSync(outputPath, processedSvg, 'utf-8');
      manifest[diagramId] = processedSvg;

      console.log(`✅ 성공: ${diagramId}.svg (CSS 변수 후처리 완료, svgId: ${svgId})`);
    } catch (error) {
      console.error(`❌ 변환 실패 (${file}):`, error);
      process.exit(1);
    }
  }

  // 매니페스트 JSON 저장 (클라이언트 인라인 렌더링용)
  fs.writeFileSync(
    MANIFEST_OUTPUT_PATH,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log(
    `✨ [Mermaid → SVG] 모든 다이어그램 생성 완료! 매니페스트: ${MANIFEST_OUTPUT_PATH}`
  );

  // 빌드 후 자동 무결성 검증 실행
  console.log('🔍 [검증] SVG 무결성 및 화살표 일치 자동 검사 시작...');
  validateBuiltDiagrams(manifest, DIAGRAMS_SRC_DIR);
}

/**
 * 빌드 후 자동 검사 함수:
 * 1. 전체 SVG 간 id 중복 여부 검사
 * 2. SVG 내 url(#id) 참조가 해당 SVG 내부에 존재하는지 검사
 * 3. .mmd 소스의 화살표 연결선 수와 SVG path의 marker 수 일치 검사
 */
function validateBuiltDiagrams(
  manifest: Record<string, string>,
  srcDir: string
) {
  const allIdsAcrossSvgs = new Map<string, string>();
  let validationErrors: string[] = [];

  for (const [diagramId, svg] of Object.entries(manifest)) {
    // 1. ID 추출 (data-id 등 제외하고 순수 id="..." 속성만 추출) 및 전역 중복 검사
    const idMatches = Array.from(svg.matchAll(/(?:^|\s)id="([^"]+)"/g)).map(
      (m) => m[1]
    );
    const internalIdSet = new Set(idMatches);

    for (const id of idMatches) {
      if (allIdsAcrossSvgs.has(id)) {
        validationErrors.push(
          `❌ ID 중복 발생: '${id}' (출현: ${allIdsAcrossSvgs.get(
            id
          )}, ${diagramId})`
        );
      } else {
        allIdsAcrossSvgs.set(id, diagramId);
      }
    }

    // 2. url(#id) 내부 참조 무결성 검사
    const urlMatches = Array.from(svg.matchAll(/url\(#([^)]+)\)/g)).map(
      (m) => m[1]
    );
    for (const refId of urlMatches) {
      if (!internalIdSet.has(refId)) {
        validationErrors.push(
          `❌ [${diagramId}] 누락된 내부 참조: url(#${refId})가 해당 SVG 내부에 정의되지 않음`
        );
      }
    }

    // 3. .mmd 소스 화살표 수 vs SVG marker-end path 수 비교
    const mmdPath = path.join(srcDir, `${diagramId}.mmd`);
    if (fs.existsSync(mmdPath)) {
      const mmdContent = fs.readFileSync(mmdPath, 'utf-8');
      
      // 화살표 패턴: -->, -.->, ==>, <-->, <-- (투명선 ~~~, 무방향 선 ---, ===, -.- 제외)
      // 주석 및 문자열 내부 제외를 위해 줄 단위 분석
      let mmdArrowCount = 0;
      const lines = mmdContent.split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        // subgraph, classDef, class, style, direction, 주석 라인 제외
        if (
          line.startsWith('subgraph') ||
          line.startsWith('classDef') ||
          line.startsWith('class ') ||
          line.startsWith('style') ||
          line.startsWith('direction') ||
          line.startsWith('%%') ||
          line.startsWith('flowchart')
        ) {
          continue;
        }

        // 연결선 패턴 매칭 (투명선 ~~~ 제외)
        // 화살표 패턴: -->, -.->, ==>, <-->, <--
        const arrowRegex = /(-->|-\.->|==>|<-->|<--)/g;
        const matches = line.match(arrowRegex);
        if (matches) {
          mmdArrowCount += matches.length;
        }
      }

      // SVG에서 marker-end 또는 marker-start 속성을 가진 path 수
      const markerPathMatches = svg.match(/marker-(end|start)="url\(#[^"]+\)"/g);
      const svgMarkerCount = markerPathMatches ? markerPathMatches.length : 0;

      if (mmdArrowCount !== svgMarkerCount) {
        validationErrors.push(
          `❌ [${diagramId}] 화살표 개수 불일치: .mmd 소스 화살표(${mmdArrowCount}개) vs SVG 마커 경로(${svgMarkerCount}개)`
        );
      } else {
        console.log(
          `  ✓ [${diagramId}] 화살표 일치 확인: ${svgMarkerCount}개 (소스 ${mmdArrowCount}개)`
        );
      }
    }
  }

  if (validationErrors.length > 0) {
    console.error('\n🚨 다이어그램 빌드 검증 실패:');
    validationErrors.forEach((err) => console.error(err));
    throw new Error('다이어그램 무결성 검증에 실패했습니다.');
  }

  console.log(
    `✅ [검증 통과] 모든 다이어그램(${Object.keys(manifest).length}개)의 ID 중복 없음 및 화살표 경로 일치 확인 완료!`
  );
}

buildDiagrams().catch((err) => {
  console.error('빌드 도중 예외 발생:', err);
  process.exit(1);
});

