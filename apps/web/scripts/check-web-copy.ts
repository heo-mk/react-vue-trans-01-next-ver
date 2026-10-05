import fs from 'fs';
import path from 'path';

import { allConcepts } from 'api/content';
import { searchConcepts } from 'api/content/search';

interface QualityReport {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

const HYPE_SCALE_TERMS = [
  '엔터프라이즈',
  '실무',
  '완벽',
  '압도적',
  '최고',
  '차세대',
];

function checkWebCopy(): QualityReport {
  console.log('🔍 [웹 화면 문구 검수] Navbar 및 홈 화면 문구 검사 시작...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  // 규칙 9: Navbar placeholder에 쓰인 모든 예시 단어의 검색 결과 1건 이상 반환 검증
  const navbarPath = path.resolve(__dirname, '../components/Navbar.tsx');
  if (fs.existsSync(navbarPath)) {
    const navbarContent = fs.readFileSync(navbarPath, 'utf-8');
    const placeholderMatch = navbarContent.match(
      /placeholder="[^"]*\(예:\s*([^)]+)\)/
    );
    if (placeholderMatch && placeholderMatch[1]) {
      const exampleWords = placeholderMatch[1]
        .split(',')
        .map((w) => w.trim())
        .filter(Boolean);

      for (const word of exampleWords) {
        const matched = searchConcepts(allConcepts, word);

        if (matched.length === 0) {
          errors.push(
            `❌ [placeholder 예시 단어 위반] Navbar 예시 단어 '${word}'의 검색 결과가 0건입니다.`
          );
        } else {
          console.log(
            `✓ [검색 예시 단어 확인] '${word}' -> ${matched.length}건 매칭 (${matched.map((m) => m.slug).join(', ')})`
          );
        }
      }
    } else {
      warnings.push(
        'Navbar.tsx에서 placeholder 예시 단어 패턴을 파싱할 수 없습니다.'
      );
    }
  } else {
    warnings.push(
      'Navbar.tsx 파일을 찾을 수 없어 placeholder 예시 단어 검증을 건너뜁니다.'
    );
  }

  // 규칙 10-1. 홈 화면 문구 검사 (apps/web/app/page.tsx)
  const homeFiles = [
    { name: 'apps/web/app/page.tsx', path: path.resolve(__dirname, '../app/page.tsx') },
  ];

  for (const file of homeFiles) {
    if (fs.existsSync(file.path)) {
      const content = fs.readFileSync(file.path, 'utf-8');
      const strippedContent = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '');
      for (const term of HYPE_SCALE_TERMS) {
        if (strippedContent.includes(term)) {
          warnings.push(
            `⚠️ [과장·규모 표현 경고] ${file.name}에 '${term}' 단어가 포함되어 있습니다. 근거 있는 표현인지 검토하세요.`
          );
        }
      }
    }
  }

  const passed = errors.length === 0;

  console.log('\n=============================================');
  if (passed) {
    console.log(
      '🎉 [검수 통과] 웹 화면 문구 지침을 100% 충족합니다!'
    );
  } else {
    console.log(
      `❌ [검수 실패] ${errors.length}개의 품질 위반 사항이 발견되었습니다:`
    );
    errors.forEach((e) => console.log('  - ' + e));
  }

  if (warnings.length > 0) {
    console.log(`⚠️ 권장 개선 사항 (${warnings.length}건):`);
    warnings.forEach((w) => console.log('  - ' + w));
  }
  console.log('=============================================\n');

  return { passed, errors, warnings };
}

const report = checkWebCopy();
if (!report.passed) {
  process.exit(1);
}
