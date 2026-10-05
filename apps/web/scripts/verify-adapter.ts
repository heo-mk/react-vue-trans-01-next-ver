import assert from 'node:assert';
import { allConcepts, axisMetadata, getConcept } from 'api/content';
import { graphqlRequest } from '../lib/graphql/client';
import {
  AXES_QUERY,
  CONCEPT_CARDS_QUERY,
  CONCEPT_DETAIL_QUERY,
} from '../lib/graphql/queries';
import type {
  GraphQLAxesResponse,
  GraphQLConceptCardsResponse,
  GraphQLConceptDetailResponse,
  GraphQLConceptDetail,
} from '../lib/graphql/types';
import {
  toConceptPage,
  toConceptCard,
  toAxisMetaMap,
} from '../lib/graphql/adapter';
import { toGraphQLAxis, toContentAxis } from '../lib/graphql/axis';

async function verifyAdapter() {
  console.log('🔍 [verify-adapter] GraphQL 응답 어댑터 전수 검증 시작...\n');

  let passedTests = 0;

  // --------------------------------------------------------------------------
  // a & c. 축 메타데이터 검증 (toAxisMetaMap)
  // --------------------------------------------------------------------------
  console.log('1. 축 메타데이터 (toAxisMetaMap) 검증:');
  const axesRes = await graphqlRequest<GraphQLAxesResponse>(AXES_QUERY);
  const adaptedAxes = toAxisMetaMap(axesRes.axes);
  assert.deepStrictEqual(
    adaptedAxes,
    axisMetadata,
    'toAxisMetaMap 결과가 axisMetadata와 일치하지 않습니다.'
  );
  console.log('  ✓ toAxisMetaMap 결과가 원본 axisMetadata와 정확히 일치함.');
  passedTests++;

  // --------------------------------------------------------------------------
  // b. 개념 카드 검증 (toConceptCard)
  // --------------------------------------------------------------------------
  console.log('\n2. 개념 카드 (toConceptCard) 검증:');
  const cardsRes =
    await graphqlRequest<GraphQLConceptCardsResponse>(CONCEPT_CARDS_QUERY);
  assert.strictEqual(
    cardsRes.concepts.length,
    allConcepts.length,
    `개념 카드 개수 불일치: 기대 ${allConcepts.length}, 실제 ${cardsRes.concepts.length}`
  );

  for (const rawCard of cardsRes.concepts) {
    const original = allConcepts.find((c) => c.slug === rawCard.slug);
    assert(original, `원본 개념을 찾을 수 없습니다: ${rawCard.slug}`);

    const adaptedCard = toConceptCard(rawCard);
    const expectedCard = {
      axis: original.axis,
      slug: original.slug,
      title: original.title,
      cardTitle: original.cardTitle,
      cardSummary: original.cardSummary,
      oneLineSummary: original.oneLineSummary,
      ...(original.cardSubtitle !== undefined
        ? { cardSubtitle: original.cardSubtitle }
        : {}),
    };
    assert.deepStrictEqual(
      adaptedCard,
      expectedCard,
      `개념 카드 불일치: ${rawCard.slug}`
    );
    console.log(`  ✓ [카드 일치] ${rawCard.slug}`);
  }
  passedTests++;

  // --------------------------------------------------------------------------
  // a. 개념 상세 검증 (toConceptPage) - 5개 전수 검증
  // --------------------------------------------------------------------------
  console.log(
    '\n3. 개념 상세 (toConceptPage) 전수 검증 (assert.deepStrictEqual):'
  );

  let formattedPlainTextCount = 0;
  let formattedStructuredCount = 0;
  let comparisonPlainTextCount = 0;
  let comparisonItemsCount = 0;

  for (const original of allConcepts) {
    const gqlAxis = toGraphQLAxis(original.axis);
    const detailRes = await graphqlRequest<GraphQLConceptDetailResponse>(
      CONCEPT_DETAIL_QUERY,
      {
        axis: gqlAxis,
        slug: original.slug,
      }
    );

    assert(detailRes.concept, `개념 응답이 null입니다: ${original.slug}`);
    const rawDetail: GraphQLConceptDetail = detailRes.concept;

    // 통계 집계: FormattedContent (analogy, pitfalls)
    if (rawDetail.analogy) {
      if (rawDetail.analogy.__typename === 'PlainText') {
        formattedPlainTextCount++;
      } else if (rawDetail.analogy.__typename === 'StructuredContent') {
        formattedStructuredCount++;
      }
    }
    for (const p of rawDetail.pitfalls) {
      if (p.answer.__typename === 'PlainText') {
        formattedPlainTextCount++;
      } else if (p.answer.__typename === 'StructuredContent') {
        formattedStructuredCount++;
      }
    }

    // 통계 집계: ComparisonCellContent (left, right, common)
    for (const row of rawDetail.comparisonTable) {
      for (const cell of [row.left, row.right, row.common]) {
        if (cell) {
          if (cell.__typename === 'PlainText') {
            comparisonPlainTextCount++;
          } else if (cell.__typename === 'ComparisonCellItems') {
            comparisonItemsCount++;
          }
        }
      }
    }

    const adaptedPage = toConceptPage(rawDetail);
    const originalFromRepo = getConcept(original.axis, original.slug);
    assert(
      originalFromRepo,
      `getConcept 결과가 없습니다: ${original.axis}/${original.slug}`
    );

    assert.deepStrictEqual(
      adaptedPage,
      originalFromRepo,
      `개념 상세 불일치: ${original.axis}/${original.slug}`
    );
    console.log(`  ✓ [상세 완벽 일치] ${original.axis}/${original.slug}`);
  }
  passedTests++;

  // --------------------------------------------------------------------------
  // d. axis.ts 예외 처리 검증
  // --------------------------------------------------------------------------
  console.log('\n4. axis.ts 에러 처리 검증:');
  assert.throws(
    () => toGraphQLAxis('invalid-axis' as any),
    /알 수 없는 Axis 값입니다/,
    '알 수 없는 Axis에 대해 오류를 던져야 합니다.'
  );
  assert.throws(
    () => toContentAxis('INVALID_AXIS'),
    /알 수 없는 GraphQL Axis 값입니다/,
    '알 수 없는 GraphQL Axis에 대해 오류를 던져야 합니다.'
  );
  console.log('  ✓ axis.ts가 모르는 값에 대해 정확히 Error를 던짐.');
  passedTests++;

  // --------------------------------------------------------------------------
  // e. 글자/객체 모양 통계 출력
  // --------------------------------------------------------------------------
  console.log('\n5. 글자/객체 모양 등장 통계:');
  console.log(
    `  - FormattedContent (비유/함정): PlainText = ${formattedPlainTextCount}개, StructuredContent = ${formattedStructuredCount}개`
  );
  console.log(
    `  - ComparisonCellContent (비교표 셀): PlainText = ${comparisonPlainTextCount}개, ComparisonCellItems = ${comparisonItemsCount}개`
  );

  assert(
    formattedPlainTextCount > 0 && formattedStructuredCount > 0,
    'FormattedContent에서 PlainText와 StructuredContent가 모두 등장해야 합니다.'
  );
  assert(
    comparisonPlainTextCount > 0 && comparisonItemsCount > 0,
    'ComparisonCellContent에서 PlainText와 ComparisonCellItems가 모두 등장해야 합니다.'
  );
  console.log(
    '  ✓ 모든 글자 모양과 객체 모양이 데이터에 실존함을 확인 완료.'
  );

  console.log(
    `\n✨ 모든 검증 통과 완료! (${passedTests}개 항목 전체 일치 검증 성공)\n`
  );
}

verifyAdapter().catch((err) => {
  console.error('\n❌ verify-adapter 실패:', err);
  process.exit(1);
});
