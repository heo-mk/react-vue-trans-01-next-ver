import { createApolloServer } from '../src/index.js';
import { allConcepts } from '../src/content/index.js';

async function runSmokeTests() {
  console.log('🚀 [Smoke Test] Apollo Server 메모리 인스턴스 검증 시작...\n');
  const server = createApolloServer();
  await server.start();

  async function query(queryString: string, variables?: Record<string, any>) {
    const res = await server.executeOperation({
      query: queryString,
      variables,
    });
    if (res.body.kind === 'single') {
      if (res.body.singleResult.errors && res.body.singleResult.errors.length > 0) {
        console.error('GraphQL 오류 발생:', res.body.singleResult.errors);
        throw new Error(`GraphQL 실행 오류: ${res.body.singleResult.errors[0].message}`);
      }
      return res.body.singleResult.data;
    }
    throw new Error('예상치 못한 응답 포맷 (incremental response)');
  }

  let failed = false;

  // 1. axes: 3개
  try {
    const data: any = await query(`
      query GetAxes {
        axes {
          axis
          title
          subtitle
          description
          badge
          leftFramework
          rightFramework
        }
      }
    `);
    if (data.axes.length === 3) {
      console.log(`✓ 1. axes 3개 확인 완료: [${data.axes.map((a: any) => a.axis).join(', ')}]`);
    } else {
      console.error(`❌ 1. axes 개수 불일치: 기대값 3개, 실제 ${data.axes.length}개`);
      failed = true;
    }
  } catch (err: any) {
    console.error('❌ 1. axes 검증 실패:', err.message);
    failed = true;
  }

  // 2. concepts: 전체 5개, REACT_VUE: 3개, VUE2_VUE3: 1개, NUXT_NEXT: 1개
  try {
    const allData: any = await query(`query { concepts { slug axis } }`);
    const rvData: any = await query(`query { concepts(axis: REACT_VUE) { slug } }`);
    const v2v3Data: any = await query(`query { concepts(axis: VUE2_VUE3) { slug } }`);
    const nnData: any = await query(`query { concepts(axis: NUXT_NEXT) { slug } }`);

    const allCount = allData.concepts.length;
    const rvCount = rvData.concepts.length;
    const v2Count = v2v3Data.concepts.length;
    const nnCount = nnData.concepts.length;

    if (allCount === 5 && rvCount === 3 && v2Count === 1 && nnCount === 1) {
      console.log(`✓ 2. concepts 필터별 개수 일치 (전체: 5, REACT_VUE: 3, VUE2_VUE3: 1, NUXT_NEXT: 1)`);
    } else {
      console.error(`❌ 2. concepts 개수 불일치: (전체:${allCount}, RV:${rvCount}, V2:${v2Count}, NN:${nnCount})`);
      failed = true;
    }
  } catch (err: any) {
    console.error('❌ 2. concepts 검증 실패:', err.message);
    failed = true;
  }

  // 3. concept(axis: REACT_VUE, slug: "reactivity-state") 존재, 없는 slug는 null
  try {
    const validData: any = await query(`
      query {
        concept(axis: REACT_VUE, slug: "reactivity-state") {
          slug
          title
        }
      }
    `);
    const invalidData: any = await query(`
      query {
        concept(axis: REACT_VUE, slug: "non-existent-slug") {
          slug
        }
      }
    `);

    if (validData.concept && validData.concept.slug === 'reactivity-state' && invalidData.concept === null) {
      console.log(`✓ 3. 단일 concept 조회 및 없는 slug의 null 반환 확인 완료`);
    } else {
      console.error(`❌ 3. concept 단일 조회 결과 불일치`);
      failed = true;
    }
  } catch (err: any) {
    console.error('❌ 3. concept 조회 실패:', err.message);
    failed = true;
  }

  // 4. 글자 또는 객체인 값 (union) 검증
  try {
    const unionData: any = await query(`
      query {
        concepts {
          slug
          analogy {
            __typename
            ... on PlainText {
              value
            }
            ... on StructuredContent {
              lead
              listType
              items {
                term
                desc
              }
            }
          }
          pitfalls {
            answer {
              __typename
              ... on PlainText {
                value
              }
              ... on StructuredContent {
                lead
                listType
                items {
                  desc
                }
              }
            }
          }
          comparisonTable {
            left {
              __typename
              ... on PlainText {
                value
              }
              ... on ComparisonCellItems {
                lead
                items
              }
            }
            right {
              __typename
              ... on PlainText {
                value
              }
              ... on ComparisonCellItems {
                lead
                items
              }
            }
            common {
              __typename
              ... on PlainText {
                value
              }
              ... on ComparisonCellItems {
                lead
                items
              }
            }
          }
        }
      }
    `);

    let foundFormattedPlainText = false;
    let foundFormattedStructured = false;
    let foundCellPlainText = false;
    let foundCellItems = false;

    let sampleFormattedPlainText: any = null;
    let sampleFormattedStructured: any = null;
    let sampleCellPlainText: any = null;
    let sampleCellItems: any = null;

    for (const c of unionData.concepts) {
      if (c.analogy) {
        if (c.analogy.__typename === 'PlainText') {
          foundFormattedPlainText = true;
          sampleFormattedPlainText = c.analogy;
        } else if (c.analogy.__typename === 'StructuredContent') {
          foundFormattedStructured = true;
          sampleFormattedStructured = c.analogy;
        }
      }
      for (const p of c.pitfalls) {
        if (p.answer.__typename === 'PlainText') {
          foundFormattedPlainText = true;
          sampleFormattedPlainText = p.answer;
        } else if (p.answer.__typename === 'StructuredContent') {
          foundFormattedStructured = true;
          sampleFormattedStructured = p.answer;
        }
      }
      for (const row of c.comparisonTable) {
        for (const cell of [row.left, row.right, row.common]) {
          if (cell) {
            if (cell.__typename === 'PlainText') {
              foundCellPlainText = true;
              sampleCellPlainText = cell;
            } else if (cell.__typename === 'ComparisonCellItems') {
              foundCellItems = true;
              sampleCellItems = cell;
            }
          }
        }
      }
    }

    console.log(`✓ 4. union 타입 반환 상태:`);
    console.log(`   - FormattedContent: PlainText(${foundFormattedPlainText}), StructuredContent(${foundFormattedStructured})`);
    if (sampleFormattedPlainText) console.log(`     [예시 PlainText]: "${sampleFormattedPlainText.value.slice(0, 30)}..."`);
    if (sampleFormattedStructured) console.log(`     [예시 StructuredContent]: lead="${sampleFormattedStructured.lead}", listType=${sampleFormattedStructured.listType}, items=${sampleFormattedStructured.items.length}개`);

    console.log(`   - ComparisonCellContent: PlainText(${foundCellPlainText}), ComparisonCellItems(${foundCellItems})`);
    if (sampleCellPlainText) console.log(`     [예시 PlainText]: "${sampleCellPlainText.value.slice(0, 30)}..."`);
    if (sampleCellItems) console.log(`     [예시 ComparisonCellItems]: items=${sampleCellItems.items.length}개 (lead: ${sampleCellItems.lead ?? 'none'})`);

    if (!foundFormattedPlainText || !foundFormattedStructured || !foundCellPlainText || !foundCellItems) {
      console.error(
        `❌ 4. 필수 union 모양 중 누락된 형태가 있습니다: FormattedContent(PlainText: ${foundFormattedPlainText}, Structured: ${foundFormattedStructured}), ComparisonCell(PlainText: ${foundCellPlainText}, Items: ${foundCellItems})`
      );
      failed = true;
    }
  } catch (err: any) {
    console.error('❌ 4. union 검증 실패:', err.message);
    failed = true;
  }

  // 5. 값이 없는 필드가 null로 내려오고 오류가 없는 것 (전체 개념 전수 대조)
  try {
    const allConceptsData: any = await query(`
      query GetAllConceptsForNullCheck {
        concepts {
          slug
          cardSubtitle
          analogy {
            __typename
          }
          comparisonNote
          diagramId
          sourceNote
        }
      }
    `);

    const checkFields = ['cardSubtitle', 'analogy', 'comparisonNote', 'diagramId', 'sourceNote'] as const;
    const stats: Record<string, { nullCount: number; valueCount: number }> = {};
    for (const f of checkFields) {
      stats[f] = { nullCount: 0, valueCount: 0 };
    }

    for (const c of allConceptsData.concepts) {
      const raw = allConcepts.find((x) => x.slug === c.slug);
      if (!raw) {
        console.error(`❌ 5. 원본 데이터에서 slug '${c.slug}'를 찾을 수 없습니다.`);
        failed = true;
        continue;
      }

      for (const field of checkFields) {
        const rawValue = (raw as any)[field];
        const resValue = c[field];

        if (rawValue === undefined) {
          if (resValue !== null) {
            console.error(`❌ 5. [${c.slug}.${field}] 원본이 undefined인데 GraphQL 응답이 null이 아닙니다: ${JSON.stringify(resValue)}`);
            failed = true;
          } else {
            stats[field].nullCount++;
          }
        } else {
          if (field === 'analogy') {
            if (resValue === null || !resValue.__typename) {
              console.error(`❌ 5. [${c.slug}.analogy] 원본이 존재하는데 GraphQL 응답이 null이거나 __typename이 없습니다.`);
              failed = true;
            } else {
              stats[field].valueCount++;
            }
          } else {
            if (resValue === null) {
              console.error(`❌ 5. [${c.slug}.${field}] 원본이 존재하는데 GraphQL 응답이 null입니다.`);
              failed = true;
            } else {
              stats[field].valueCount++;
            }
          }
        }
      }
    }

    console.log(`✓ 5. Nullable 필드 검증 결과:`);
    for (const field of checkFields) {
      const { nullCount, valueCount } = stats[field];
      if (nullCount > 0 && valueCount > 0) {
        console.log(`   ✓ '${field}': null인 경우(${nullCount}건)와 값이 있는 경우(${valueCount}건) 모두 확인 완료`);
      } else if (nullCount > 0 && valueCount === 0) {
        console.log(`   ℹ️ '${field}': null인 경우만 확인됨 (${nullCount}건, 전체 데이터셋에 값 없음)`);
      } else if (nullCount === 0 && valueCount > 0) {
        console.log(`   ℹ️ '${field}': 값이 있는 경우만 확인됨 (${valueCount}건, 전체 데이터셋에 null 없음)`);
      } else {
        console.warn(`   ⚠️ '${field}': 데이터 없음`);
      }
    }
  } catch (err: any) {
    console.error('❌ 5. Nullable 필드 검증 실패:', err.message);
    failed = true;
  }

  // 6. Axis, Side, ListType enum 값이 GraphQL 이름으로 내려오는 것
  try {
    const enumData: any = await query(`
      query {
        concept(axis: REACT_VUE, slug: "reactivity-state") {
          axis
          codeExamples {
            highlights {
              side
            }
          }
          analogy {
            ... on StructuredContent {
              listType
            }
          }
        }
      }
    `);
    const c = enumData.concept;
    const axisEnum = c.axis;
    const sideEnum = c.codeExamples[0]?.highlights?.[0]?.side;
    const listTypeEnum = c.analogy?.listType;

    if (axisEnum === 'REACT_VUE' && sideEnum === 'LEFT' && listTypeEnum === 'BULLET') {
      console.log(`✓ 6. Enum GraphQL 이름 반환 확인 완료 (Axis: ${axisEnum}, Side: ${sideEnum}, ListType: ${listTypeEnum})`);
    } else {
      console.error(`❌ 6. Enum 반환값 불일치 (Axis: ${axisEnum}, Side: ${sideEnum}, ListType: ${listTypeEnum})`);
      failed = true;
    }
  } catch (err: any) {
    console.error('❌ 6. Enum 검증 실패:', err.message);
    failed = true;
  }

  // 7. search 12개 검색어가 test-search.ts의 기대 결과와 같은 것
  const testQueries = [
    { q: '동기화 부담', expectedCount: 1, expectedSlugs: ['global-state'] },
    { q: '이중 네트워크', expectedCount: 1, expectedSlugs: ['rendering-modes'] },
    { q: 'Double Fetching', expectedCount: 1, expectedSlugs: ['rendering-modes'] },
    { q: '초인종', expectedCount: 1, expectedSlugs: ['reactivity-state'] },
    { q: 'Nitro', expectedCount: 1, expectedSlugs: ['rendering-modes'] },
    { q: 'CCTV', expectedCount: 2, expectedSlugs: ['reactivity-state', 'options-to-composition'] },
    { q: 'Stale 마킹', expectedCount: 1, expectedSlugs: ['server-state'] },
    { q: 'toRefs', expectedCount: 2, expectedSlugs: ['global-state', 'options-to-composition'] },
    { q: 'useState', expectedCount: 3, expectedSlugs: ['reactivity-state', 'global-state', 'rendering-modes'] },
    { q: 'ref', expectedCount: 5, expectedSlugs: ['reactivity-state', 'global-state', 'server-state', 'options-to-composition', 'rendering-modes'] },
    { q: 'RSC', expectedCount: 1, expectedSlugs: ['rendering-modes'] },
    { q: 'Zustand', expectedCount: 2, expectedSlugs: ['global-state', 'server-state'] },
  ];

  console.log('✓ 7. search 12개 쿼리 검증 시작:');
  for (const item of testQueries) {
    try {
      const searchRes: any = await query(`query Search($q: String!) { search(query: $q) { slug } }`, { q: item.q });
      const slugs: string[] = searchRes.search.map((s: any) => s.slug);
      const isCountMatch = slugs.length === item.expectedCount;
      const isSlugMatch = JSON.stringify(slugs) === JSON.stringify(item.expectedSlugs);

      if (isCountMatch && isSlugMatch) {
        console.log(`   ✓ '${item.q}' -> ${slugs.length}건 [${slugs.join(', ')}] 일치`);
      } else {
        console.error(`   ❌ '${item.q}' 불일치: 기대 [${item.expectedSlugs.join(', ')}], 실제 [${slugs.join(', ')}]`);
        failed = true;
      }
    } catch (err: any) {
      console.error(`   ❌ '${item.q}' 쿼리 실패:`, err.message);
      failed = true;
    }
  }

  // 7-1. 검색 예외 상황 검증 (Navbar.tsx filteredConcepts 로직 기준)
  console.log('✓ 7-1. 검색 예외 상황 검증 시작:');
  const edgeCaseQueries = [
    { name: '빈 문자열 ("")', query: '', expectedCount: 0, expectedSlugs: [] },
    { name: '공백만 있는 문자열 ("   ")', query: '   ', expectedCount: 0, expectedSlugs: [] },
    { name: '소문자 검색 ("zustand")', query: 'zustand', expectedCount: 2, expectedSlugs: ['global-state', 'server-state'] },
    { name: '없는 단어 ("zzzzqq")', query: 'zzzzqq', expectedCount: 0, expectedSlugs: [] },
    { name: '앞뒤 공백 ("  Zustand  ")', query: '  Zustand  ', expectedCount: 2, expectedSlugs: ['global-state', 'server-state'] },
  ];

  for (const item of edgeCaseQueries) {
    try {
      const searchRes: any = await query(`query SearchEdge($q: String!) { search(query: $q) { slug } }`, { q: item.query });
      const slugs: string[] = searchRes.search.map((s: any) => s.slug);
      const isCountMatch = slugs.length === item.expectedCount;
      const isSlugMatch = JSON.stringify(slugs) === JSON.stringify(item.expectedSlugs);

      if (isCountMatch && isSlugMatch) {
        console.log(`   ✓ ${item.name} -> ${slugs.length}건 [${slugs.join(', ')}] 일치`);
      } else {
        console.error(`   ❌ ${item.name} 불일치: 기대 [${item.expectedSlugs.join(', ')}], 실제 [${slugs.join(', ')}]`);
        failed = true;
      }
    } catch (err: any) {
      console.error(`   ❌ ${item.name} 쿼리 실패:`, err.message);
      failed = true;
    }
  }

  // 8. "카드용 필드만" 요청했을 때 요청하지 않은 필드가 없는 것
  try {
    const cardData: any = await query(`
      query GetCardFields {
        concept(axis: REACT_VUE, slug: "reactivity-state") {
          slug
          axis
          cardTitle
          cardSummary
        }
      }
    `);
    const keys = Object.keys(cardData.concept);
    const expectedKeys = ['slug', 'axis', 'cardTitle', 'cardSummary'];
    const hasOnlyExpectedKeys = keys.length === expectedKeys.length && expectedKeys.every((k) => keys.includes(k));

    if (hasOnlyExpectedKeys) {
      console.log(`✓ 8. 카드용 필드만 요청 시 정확히 요청 필드만 반환됨 (${keys.join(', ')})`);
    } else {
      console.error(`❌ 8. 필드 오염 확인: 반환된 키 [${keys.join(', ')}]`);
      failed = true;
    }
  } catch (err: any) {
    console.error('❌ 8. 카드 필드 검증 실패:', err.message);
    failed = true;
  }

  await server.stop();

  if (failed) {
    console.error('\n🚨 일부 Smoke 테스트가 실패했습니다.');
    process.exit(1);
  } else {
    console.log('\n🎉 [Smoke Test 통과] 모든 검증 항목을 완벽히 통과했습니다!');
  }
}

runSmokeTests().catch((err) => {
  console.error('Smoke 테스트 예외 발생:', err);
  process.exit(1);
});
