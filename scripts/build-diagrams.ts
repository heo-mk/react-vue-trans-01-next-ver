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

function postProcessSvg(svgContent: string): string {
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

      // mermaid-cli (mmdc) 실행
      execSync(
        `pnpm exec mmdc ${puppeteerFlag} -i "${inputPath}" -o "${outputPath}" -b transparent`,
        {
          stdio: 'pipe',
        }
      );

      // 생성된 SVG 읽기 및 색상 CSS 변수 치환 후처리
      const rawSvg = fs.readFileSync(outputPath, 'utf-8');
      const processedSvg = postProcessSvg(rawSvg);

      // 후처리된 SVG 덮어쓰기
      fs.writeFileSync(outputPath, processedSvg, 'utf-8');
      manifest[diagramId] = processedSvg;

      console.log(`✅ 성공: ${diagramId}.svg (CSS 변수 후처리 완료)`);
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
}

buildDiagrams().catch((err) => {
  console.error('빌드 도중 예외 발생:', err);
  process.exit(1);
});
