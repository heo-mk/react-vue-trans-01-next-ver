import { allConcepts } from '../content/index';

interface QualityReport {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function checkConceptQuality(): QualityReport {
  console.log('🔍 [콘텐츠 품질 검수] dev-guide 규칙 전수 검사 시작...\n');

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!allConcepts || allConcepts.length === 0) {
    errors.push('❌ 등록된 개념 데이터가 없습니다.');
    return { passed: false, errors, warnings };
  }

  // 규칙 0: 세 축 모두 최소 1개 이상의 개념 페이지 존재 여부 (Definition of Done)
  const axes = ['react-vue', 'vue2-vue3', 'nuxt-next'] as const;
  for (const axis of axes) {
    const count = allConcepts.filter((c) => c.axis === axis).length;
    if (count === 0) {
      errors.push(
        `❌ [DoD 위반] '${axis}' 축에 등록된 개념 페이지가 없습니다.`
      );
    } else {
      console.log(`✓ [축 확인] ${axis}: ${count}개 개념 등록됨`);
    }
  }

  for (const concept of allConcepts) {
    const id = `[${concept.axis}/${concept.slug}]`;

    // 규칙 1: 파인만 테크닉 한줄 요약 (3-1)
    if (!concept.oneLineSummary || concept.oneLineSummary.length < 15) {
      errors.push(
        `${id} 한줄 요약(oneLineSummary)이 너무 짧거나 비어 있습니다.`
      );
    }

    // 규칙 2: 비교표 구분선 및 데이터 행 (4-4)
    if (!concept.comparisonTable || concept.comparisonTable.length < 3) {
      errors.push(
        `${id} 비교표(comparisonTable)에 최소 3개 이상의 행이 필요합니다.`
      );
    } else {
      concept.comparisonTable.forEach((row, i) => {
        if (!row.label || !row.left || !row.right) {
          errors.push(`${id} 비교표 ${i + 1}번째 행에 빈 필드가 있습니다.`);
        }
      });
    }

    // 규칙 3: 코드 예제 버전 명시 (4-6 강제)
    if (!concept.codeExamples || concept.codeExamples.length === 0) {
      errors.push(`${id} 코드 예제(codeExamples)가 없습니다.`);
    } else {
      concept.codeExamples.forEach((ex, i) => {
        if (!ex.version || ex.version.trim() === '') {
          errors.push(
            `${id} 코드 예제 ${i + 1} (${ex.label})에 버전(version)이 명시되지 않았습니다 (4-6 규칙 위반).`
          );
        }
        if (!ex.leftCode || !ex.rightCode) {
          errors.push(`${id} 코드 예제 ${i + 1}에 코드 내용이 비어 있습니다.`);
        }
      });
    }

    // 규칙 4: Vue2 → Vue3 단방향성 검증 (Options API → Composition API)
    if (concept.axis === 'vue2-vue3') {
      concept.codeExamples.forEach((ex, i) => {
        const leftHasSetup = ex.leftCode.includes('<script setup>');
        const rightHasOptions =
          ex.rightCode.includes('export default {') &&
          ex.rightCode.includes('methods:');

        if (leftHasSetup || rightHasOptions) {
          errors.push(
            `${id} 코드 예제 ${i + 1}: Vue2→Vue3 예제의 방향성이 역전되었거나 잘못되었습니다. (Before는 Options API, After는 Composition API여야 함)`
          );
        }
      });
    }

    // 규칙 5: 인용 표현 출처 명시 (3-6)
    if (concept.analogy && !concept.sourceNote) {
      warnings.push(
        `${id} 독창적 비유(analogy)가 포함되어 있으나 출처(sourceNote)가 명시되지 않았습니다.`
      );
    }

    // 규칙 6: 면접/학습 함정 (pitfalls)
    if (!concept.pitfalls || concept.pitfalls.length === 0) {
      errors.push(`${id} 함정 문답(pitfalls)이 1개 이상 정의되어야 합니다.`);
    } else {
      concept.pitfalls.forEach((pf, i) => {
        if (!pf.question || !pf.answer) {
          errors.push(
            `${id} 함정 문답 ${i + 1}에 빈 질문 또는 답변이 있습니다.`
          );
        }
      });
    }

    // 규칙 7: 출처 목록
    if (!concept.sources || concept.sources.length === 0) {
      warnings.push(`${id} 참고 출처(sources) 목록이 비어 있습니다.`);
    }
  }

  const passed = errors.length === 0;

  console.log('\n=============================================');
  if (passed) {
    console.log(
      '🎉 [검수 통과] 모든 개념 페이지가 dev-guide 품질 지침을 100% 충족합니다!'
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

const report = checkConceptQuality();
if (!report.passed) {
  process.exit(1);
}
