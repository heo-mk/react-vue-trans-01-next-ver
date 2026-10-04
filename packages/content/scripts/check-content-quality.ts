import fs from 'fs';
import path from 'path';
import { allConcepts } from '../index';
import { getContentPlainText, getComparisonCellPlainText } from '../schema';

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

    // 규칙 1-2: 카드 제목(cardTitle) 필수 및 20자 이내 검증 (영문/기호 시각적 너비 고려)
    if (!concept.cardTitle || concept.cardTitle.trim().length === 0) {
      errors.push(`${id} 카드 제목(cardTitle)이 비어 있습니다.`);
    } else {
      const visualLength = concept.cardTitle
        .split('')
        .reduce((acc, char) => acc + (char.charCodeAt(0) > 127 ? 1 : 0.6), 0);
      if (concept.cardTitle.length > 25 || visualLength > 20) {
        errors.push(
          `${id} 카드 제목(cardTitle: "${concept.cardTitle}")은 20자 이내여야 합니다. (현재 ${concept.cardTitle.length}자)`
        );
      }
    }

    // 규칙 1-2-1: 카드 부제(cardSubtitle) 28자 이내 및 말줄임 문자("...", "…") 금지 검증 (영문/기호 시각적 너비 고려)
    if (concept.cardSubtitle) {
      if (
        concept.cardSubtitle.includes('...') ||
        concept.cardSubtitle.includes('…')
      ) {
        errors.push(
          `${id} 카드 부제(cardSubtitle: "${concept.cardSubtitle}")에 말줄임표가 포함되어 있습니다.`
        );
      }
      const visualLength = concept.cardSubtitle
        .split('')
        .reduce((acc, char) => acc + (char.charCodeAt(0) > 127 ? 1 : 0.6), 0);
      if (concept.cardSubtitle.length > 35 || visualLength > 28) {
        errors.push(
          `${id} 카드 부제(cardSubtitle: "${concept.cardSubtitle}")은 28자 이내여야 합니다. (현재 ${concept.cardSubtitle.length}자, 시각적 ${Math.round(visualLength)}자)`
        );
      }
    }

    // 규칙 1-3: 카드 요약(cardSummary) 필수, 45자 이내, 한 문장 검증
    if (!concept.cardSummary || concept.cardSummary.trim().length === 0) {
      errors.push(`${id} 카드 요약(cardSummary)이 비어 있습니다.`);
    } else {
      if (concept.cardSummary.length > 45) {
        errors.push(
          `${id} 카드 요약(cardSummary: "${concept.cardSummary}")은 45자 이내여야 합니다. (현재 ${concept.cardSummary.length}자)`
        );
      }
      const isMultipleSentences =
        /[.!?]\s+[가-힣A-Za-z0-9]/.test(concept.cardSummary.trim()) ||
        concept.cardSummary.includes('\n');
      if (isMultipleSentences) {
        errors.push(
          `${id} 카드 요약(cardSummary: "${concept.cardSummary}")은 한 문장이어야 합니다.`
        );
      }
    }

    // 규칙 2: 비교표 구분선 및 데이터 행 (4-4)
    if (!concept.comparisonTable || concept.comparisonTable.length < 3) {
      errors.push(
        `${id} 비교표(comparisonTable)에 최소 3개 이상의 행이 필요합니다.`
      );
    } else {
      concept.comparisonTable.forEach((row, i) => {
        if (!row.label || (!row.common && (!row.left || !row.right))) {
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

    // 규칙 4-2: 코드 하이라이트(highlights) 및 핵심 차이(keyPoints) 정합성 검증
    concept.codeExamples?.forEach((ex, i) => {
      if (ex.highlights || ex.keyPoints) {
        const highlights = ex.highlights || [];
        const keyPoints = ex.keyPoints || [];

        if (highlights.length === 0 && keyPoints.length > 0) {
          errors.push(
            `${id} 코드 예제 ${i + 1} (${ex.label}): keyPoints가 정의되었으나 highlights가 없습니다.`
          );
        }
        if (keyPoints.length === 0 && highlights.length > 0) {
          errors.push(
            `${id} 코드 예제 ${i + 1} (${ex.label}): highlights가 정의되었으나 keyPoints가 없습니다.`
          );
        }

        // id는 1부터 연속
        const kpIds = keyPoints.map((kp) => kp.id).sort((a, b) => a - b);
        for (let k = 0; k < kpIds.length; k++) {
          if (kpIds[k] !== k + 1) {
            errors.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): keyPoints의 id는 1부터 연속이어야 합니다. (기대: ${k + 1}, 실제: ${kpIds[k]})`
            );
            break;
          }
        }

        const kpIdSet = new Set(keyPoints.map((kp) => kp.id));
        const hlIdSet = new Set(highlights.map((h) => h.id));

        // highlights의 모든 id는 keyPoints에 있어야 함
        highlights.forEach((h) => {
          if (!kpIdSet.has(h.id)) {
            errors.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): highlight의 id ${h.id}가 keyPoints에 존재하지 않습니다.`
            );
          }
        });

        // keyPoints의 모든 id는 highlights에 최소 한 번 쓰여야 함
        keyPoints.forEach((kp) => {
          if (!hlIdSet.has(kp.id)) {
            errors.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): keyPoint id ${kp.id}('${kp.title}')가 highlights에 한 번도 사용되지 않았습니다.`
            );
          }
        });

        // match는 해당 쪽 코드에서 정확히 한 줄에만 포함되어야 함 (0줄 또는 2줄 이상이면 오류)
        highlights.forEach((h) => {
          const targetCode = h.side === 'left' ? ex.leftCode : ex.rightCode;
          const lines = targetCode.split('\n');
          const matchedLines = lines.filter((line) => line.includes(h.match));

          if (matchedLines.length === 0) {
            errors.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): ${h.side}측 match "${h.match}"에 일치하는 줄이 없습니다 (0줄 일치 오류).`
            );
          } else if (matchedLines.length > 1) {
            errors.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): ${h.side}측 match "${h.match}"에 일치하는 줄이 ${matchedLines.length}줄입니다 (정확히 1줄이어야 함).`
            );
          }
        });

        // title은 12자 이내, left와 right 설명은 각각 50자 이내가 아니면 경고
        keyPoints.forEach((kp) => {
          if (kp.title.length > 12) {
            warnings.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): keyPoint title "${kp.title}"은 12자 이내여야 합니다 (현재 ${kp.title.length}자).`
            );
          }
          if (kp.left.length > 50) {
            warnings.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): keyPoint id ${kp.id} left 설명은 50자 이내여야 합니다 (현재 ${kp.left.length}자).`
            );
          }
          if (kp.right.length > 50) {
            warnings.push(
              `${id} 코드 예제 ${i + 1} (${ex.label}): keyPoint id ${kp.id} right 설명은 50자 이내여야 합니다 (현재 ${kp.right.length}자).`
            );
          }
        });
      }
    });

    // 규칙 5: 화면에 표시되는 출처 표기는 외부 링크(http로 시작하는 주소)가 있는 것만 허용
    if (concept.sourceNote) {
      errors.push(
        `❌ ${id} [내부 작업 정보 금지] 내부 작업용 출처 표기(sourceNote: "${concept.sourceNote}")는 허용되지 않습니다. 출처는 sources 필드의 클릭 가능한 외부 공식 문서 URL이어야 합니다.`
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
        } else {
          // 신규 규칙 A: 목록이 없는 답변이 200자를 넘으면 경고
          if (typeof pf.answer === 'string') {
            if (pf.answer.length > 200) {
              warnings.push(
                `${id} 함정 문답 ${i + 1}: 목록이 없는 산문 답변이 200자를 초과합니다 (${pf.answer.length}자). 가독성을 위해 목록 분리를 권장합니다.`
              );
            }
          } else {
            // 신규 규칙 B: 목록 항목이 6개를 넘으면 경고
            if (pf.answer.items && pf.answer.items.length > 6) {
              warnings.push(
                `${id} 함정 문답 ${i + 1}: 목록 항목이 6개를 초과합니다 (${pf.answer.items.length}개). 인지 부담 완화를 위해 2~5개 항목을 권장합니다.`
              );
            }
          }
        }
      });
    }

    // 규칙 7: 공식 문서 및 출처 목록 (클릭 가능한 외부 URL 필수, 내부 자기참조 금지)
    if (!concept.sources || concept.sources.length === 0) {
      warnings.push(`${id} 참고 출처(sources) 목록이 비어 있습니다.`);
    } else {
      concept.sources.forEach((src, i) => {
        if (!src.label || src.label.trim() === '') {
          errors.push(
            `${id} 참고 출처 ${i + 1}번째 항목의 라벨(label)이 비어 있습니다.`
          );
        }
        if (!src.url || src.url.trim() === '' || !src.url.startsWith('http')) {
          errors.push(
            `${id} 참고 출처 ${i + 1}번째 항목("${src.label}"): 사용자가 실제로 클릭해서 열어볼 수 있는 외부 URL이 누락되었거나 유효하지 않습니다. (http/https 외부 링크 필수)`
          );
        }
        if (
          /(보고서|[0-9]+장|[0-9]+\.[0-9]+|섹션)/.test(src.label)
        ) {
          errors.push(
            `${id} 참고 출처 "${src.label}": 내부 보고서/섹션 자기참조는 참고문헌 목록에 넣을 수 없습니다.`
          );
        }
      });
    }

    // 규칙 8: 검색 키워드(keywords) 1개 이상 등록 여부
    if (!concept.keywords || concept.keywords.length === 0) {
      errors.push(`${id} 검색 키워드(keywords)가 1개 이상 등록되어야 합니다.`);
    } else {
      concept.keywords.forEach((kw, i) => {
        if (!kw || kw.trim() === '') {
          errors.push(
            `${id} 검색 키워드 ${i + 1}번째 항목이 빈 문자열입니다.`
          );
        }
      });
    }

    // 규칙 10: 내부 작업용 정보 및 특정 개인 프로젝트/업종 금지어 전수 검증
    const INTERNAL_WORK_TERMS = [
      '통합보고서',
      '두번째 보고서',
      '보고서',
      '인용 및 통합',
      '01_',
      '02_',
      '03_',
      '노트',
      '정리본',
    ];

    const FORBIDDEN_TERMS = [
      ...INTERNAL_WORK_TERMS,
      // 프로젝트 이름
      'GitFind',
      'smartstore-item-finder',
      '퇴직금 회수 가이드',
      'SFlash',
      // 특정 서비스 및 업종 표현
      '이커머스',
      '스마트스토어',
      '법률·노무',
      '노무·법률',
      '퇴직금',
      '소멸시효',
      '법령·약관',
      '법령 및 판례',
      // 개인 경험/프로젝트 전제 표현
      '우리 서비스',
      '제 프로젝트',
      '실무 예시',
      '실무 대시보드',
      '찜 버튼',
      // 특정 프로젝트 도메인 식별자
      'useRepoMutations',
      'useRepoSearch',
      'useRepoStore',
      'useStatutesQuery',
    ];

    const checkTextForForbidden = (
      text: string | undefined,
      location: string
    ) => {
      if (!text) return;
      for (const term of FORBIDDEN_TERMS) {
        if (text.includes(term)) {
          const isInternalWork = INTERNAL_WORK_TERMS.includes(term);
          const category = isInternalWork
            ? '내부 작업용 정보 위반'
            : '특정 프로젝트/업종 표현 위반';
          errors.push(
            `❌ ${id} [${category}] ${location}에 금지 문자열 '${term}'이(가) 포함되어 있습니다.`
          );
        }
      }
    };

    checkTextForForbidden(concept.title, '제목(title)');
    checkTextForForbidden(concept.cardTitle, '카드 제목(cardTitle)');
    checkTextForForbidden(concept.cardSubtitle, '카드 부제(cardSubtitle)');
    checkTextForForbidden(concept.cardSummary, '카드 요약(cardSummary)');
    checkTextForForbidden(concept.oneLineSummary, '한줄 요약(oneLineSummary)');
    checkTextForForbidden(getContentPlainText(concept.analogy), '비유(analogy)');
    checkTextForForbidden(concept.comparisonNote, '비교표 참고(comparisonNote)');
    checkTextForForbidden(concept.sourceNote, '출처(sourceNote)');
    concept.comparisonTable?.forEach((row, i) => {
      checkTextForForbidden(row.label, `비교표 ${i + 1}행 라벨`);
      checkTextForForbidden(getComparisonCellPlainText(row.left), `비교표 ${i + 1}행 좌측`);
      checkTextForForbidden(getComparisonCellPlainText(row.right), `비교표 ${i + 1}행 우측`);
      checkTextForForbidden(getComparisonCellPlainText(row.common), `비교표 ${i + 1}행 공통`);
    });
    concept.codeExamples?.forEach((ex, i) => {
      checkTextForForbidden(ex.label, `코드 예제 ${i + 1} 라벨`);
      checkTextForForbidden(ex.version, `코드 예제 ${i + 1} 버전`);
      checkTextForForbidden(
        ex.sourceProject,
        `코드 예제 ${i + 1} 출처 프로젝트(sourceProject)`
      );
      checkTextForForbidden(ex.leftCode, `코드 예제 ${i + 1} 좌측 코드`);
      checkTextForForbidden(ex.rightCode, `코드 예제 ${i + 1} 우측 코드`);
      ex.keyPoints?.forEach((kp) => {
        checkTextForForbidden(kp.title, `코드 예제 ${i + 1} 핵심차이 title`);
        checkTextForForbidden(kp.left, `코드 예제 ${i + 1} 핵심차이 left`);
        checkTextForForbidden(kp.right, `코드 예제 ${i + 1} 핵심차이 right`);
      });
    });
    concept.pitfalls?.forEach((pf, i) => {
      checkTextForForbidden(pf.question, `함정 문답 ${i + 1} 질문`);
      checkTextForForbidden(getContentPlainText(pf.answer), `함정 문답 ${i + 1} 답변`);
    });
    concept.keywords?.forEach((kw, i) => {
      checkTextForForbidden(kw, `키워드 ${i + 1}번째`);
    });
    concept.sources?.forEach((src, i) => {
      checkTextForForbidden(src.label, `참고 출처 ${i + 1}번째 라벨`);
      checkTextForForbidden(src.url, `참고 출처 ${i + 1}번째 URL`);
    });
  }

  // 규칙 10: 근거 없는 규모·수준 과장 표현 경고 (실패 처리는 하지 않음)
  // 대상: "엔터프라이즈", "실무", "완벽", "압도적", "최고", "차세대"
  // 제외: "필수", "대규모", "강력" (기술 설명에서 쓰이는 경우가 있어 제외)
  const HYPE_SCALE_TERMS = [
    '엔터프라이즈',
    '실무',
    '완벽',
    '압도적',
    '최고',
    '차세대',
  ];

  // 10-1. 메타데이터 문구 검사 (packages/content/index.ts)
  const metaFiles = [
    { name: 'packages/content/index.ts', path: path.resolve(__dirname, '../index.ts') },
  ];

  for (const file of metaFiles) {
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

  // 10-2. 개념 파일 및 데이터 검사
  for (const concept of allConcepts) {
    const id = `[${concept.axis}/${concept.slug}]`;
    const checkHype = (text: string | undefined, loc: string) => {
      if (!text) return;
      for (const term of HYPE_SCALE_TERMS) {
        if (text.includes(term)) {
          warnings.push(
            `⚠️ ${id} [과장·규모 표현 경고] ${loc}에 '${term}' 단어가 사용되었습니다. (근거 없는 규모/수준 수식어 지양)`
          );
        }
      }
    };

    checkHype(concept.title, '제목(title)');
    checkHype(concept.cardTitle, '카드 제목(cardTitle)');
    checkHype(concept.cardSubtitle, '카드 부제(cardSubtitle)');
    checkHype(concept.cardSummary, '카드 요약(cardSummary)');
    checkHype(concept.oneLineSummary, '한줄 요약(oneLineSummary)');
    checkHype(getContentPlainText(concept.analogy), '비유(analogy)');
    checkHype(concept.comparisonNote, '비교표 참고(comparisonNote)');
    checkHype(concept.sourceNote, '출처(sourceNote)');
    concept.comparisonTable?.forEach((row, i) => {
      checkHype(row.label, `비교표 ${i + 1}행 라벨`);
      checkHype(getComparisonCellPlainText(row.left), `비교표 ${i + 1}행 좌측`);
      checkHype(getComparisonCellPlainText(row.right), `비교표 ${i + 1}행 우측`);
      checkHype(getComparisonCellPlainText(row.common), `비교표 ${i + 1}행 공통`);
    });
    concept.codeExamples?.forEach((ex, i) => {
      checkHype(ex.label, `코드 예제 ${i + 1} 라벨`);
      checkHype(ex.sourceProject, `코드 예제 ${i + 1} 출처 프로젝트(sourceProject)`);
      ex.keyPoints?.forEach((kp) => {
        checkHype(kp.title, `코드 예제 ${i + 1} 핵심차이 title`);
        checkHype(kp.left, `코드 예제 ${i + 1} 핵심차이 left`);
        checkHype(kp.right, `코드 예제 ${i + 1} 핵심차이 right`);
      });
    });
    concept.pitfalls?.forEach((pf, i) => {
      checkHype(pf.question, `함정/FAQ ${i + 1} 질문`);
      checkHype(getContentPlainText(pf.answer), `함정/FAQ ${i + 1} 답변`);
    });
    concept.keywords?.forEach((kw, i) => {
      checkHype(kw, `키워드 ${i + 1}번째`);
    });
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
