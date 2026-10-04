import { searchConceptCards, SearchError } from '../lib/graphql/searchClient';
import { allConcepts } from 'api/content';
import { searchConcepts } from 'api/content/search';

async function main() {
  console.log('🔍 [verify-search-client] 검색 클라이언트 종합 검증 시작...\n');
  let failed = false;

  // 1. 'Zustand' 검증
  try {
    const res = await searchConceptCards('Zustand');
    const slugs = res.map((r) => r.slug);
    const axes = res.map((r) => r.axis);
    const isSlugsMatch =
      JSON.stringify(slugs) === JSON.stringify(['global-state', 'server-state']);
    const isAxesLower = axes.every(
      (a) => a === 'react-vue' || a === 'vue2-vue3' || a === 'nuxt-next'
    );

    if (isSlugsMatch && isAxesLower && res.length === 2) {
      console.log(
        `✓ 1. 'Zustand' 검색 성공: 2건 [${slugs.join(', ')}], axis 소문자 확인 [${axes.join(', ')}]`
      );
    } else {
      console.error(
        `❌ 1. 'Zustand' 검색 실패: 기대 [global-state, server-state], 실제 [${slugs.join(', ')}]`
      );
      failed = true;
    }
  } catch (err) {
    console.error('❌ 1. Zustand 검색 예외:', err);
    failed = true;
  }

  // 2. '  Zustand  ' 앞뒤 공백 검증
  try {
    const res = await searchConceptCards('  Zustand  ');
    const slugs = res.map((r) => r.slug);
    if (
      JSON.stringify(slugs) === JSON.stringify(['global-state', 'server-state'])
    ) {
      console.log(`✓ 2. '  Zustand  ' 앞뒤 공백 검색 성공: 2건 [${slugs.join(', ')}]`);
    } else {
      console.error(`❌ 2. '  Zustand  ' 검색 실패: 실제 [${slugs.join(', ')}]`);
      failed = true;
    }
  } catch (err) {
    console.error('❌ 2. 앞뒤 공백 검색 예외:', err);
    failed = true;
  }

  // 3. '' 와 '   ' 빈 검색어 및 fetch 미호출 검증
  const originalFetch = globalThis.fetch;
  let fetchCallCount = 0;
  globalThis.fetch = async (...args) => {
    fetchCallCount++;
    return originalFetch(...args);
  };

  try {
    const resEmpty = await searchConceptCards('');
    const resSpaces = await searchConceptCards('   ');
    if (resEmpty.length === 0 && resSpaces.length === 0 && fetchCallCount === 0) {
      console.log(
        `✓ 3. 빈 검색어('', '   ') 결과 빈 배열 [] 및 fetch 0회 호출 확인 (호출 수: ${fetchCallCount})`
      );
    } else {
      console.error(
        `❌ 3. 빈 검색어 처리 실패: resEmpty=${resEmpty.length}, resSpaces=${resSpaces.length}, fetchCalls=${fetchCallCount}`
      );
      failed = true;
    }
  } catch (err) {
    console.error('❌ 3. 빈 검색어 예외:', err);
    failed = true;
  } finally {
    globalThis.fetch = originalFetch;
  }

  // 4. 'zzzzqq' 일치 없는 단어
  try {
    const res = await searchConceptCards('zzzzqq');
    if (res.length === 0) {
      console.log(`✓ 4. 일치 없는 검색어('zzzzqq') 결과 빈 배열 [] 확인`);
    } else {
      console.error(`❌ 4. 'zzzzqq' 결과가 비어있지 않음: ${res.length}건`);
      failed = true;
    }
  } catch (err) {
    console.error('❌ 4. zzzzqq 검색 예외:', err);
    failed = true;
  }

  // 5. 12개 검색어 동등성 검증 (api/content/search의 searchConcepts와 비교)
  const test12Queries = [
    '동기화 부담',
    '이중 네트워크',
    'Double Fetching',
    '초인종',
    'Nitro',
    'CCTV',
    'Stale 마킹',
    'toRefs',
    'useState',
    'ref',
    'RSC',
    'Zustand',
  ];

  console.log('✓ 5. 12개 검색어 일치성 검증 시작:');
  for (const q of test12Queries) {
    try {
      const expectedSlugs = searchConcepts(allConcepts, q).map((c) => c.slug);
      const actualCards = await searchConceptCards(q);
      const actualSlugs = actualCards.map((c) => c.slug);

      const isMatch =
        JSON.stringify(actualSlugs) === JSON.stringify(expectedSlugs);
      if (!isMatch) {
        console.error(
          `   ❌ '${q}' 불일치: 기대 [${expectedSlugs.join(', ')}], 실제 [${actualSlugs.join(', ')}]`
        );
        failed = true;
      } else {
        if (q === 'CCTV' && actualCards.length !== 2) {
          console.error(
            `   ❌ 'CCTV' 고정 건수 불일치: 기대 2건, 실제 ${actualCards.length}건`
          );
          failed = true;
        } else if (q === 'ref' && actualCards.length !== 5) {
          console.error(
            `   ❌ 'ref' 고정 건수 불일치: 기대 5건, 실제 ${actualCards.length}건`
          );
          failed = true;
        } else {
          console.log(`   ✓ '${q}' -> ${actualCards.length}건 [${actualSlugs.join(', ')}] 일치`);
        }
      }
    } catch (err) {
      console.error(`   ❌ '${q}' 검색 실패:`, err);
      failed = true;
    }
  }

  // 6. AbortController 호출 직후 abort 시 AbortError 발생
  try {
    const ac = new AbortController();
    const promise = searchConceptCards('reactivity-state', ac.signal);
    ac.abort();
    await promise;
    console.error('❌ 6. AbortController abort 후 예외가 발생하지 않음');
    failed = true;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.log(`✓ 6. AbortController abort 시 정상적으로 AbortError 수신 완료`);
    } else {
      console.error('❌ 6. 기대한 AbortError가 아닌 다른 에러 수신:', err);
      failed = true;
    }
  }

  // 7. 잘못된 주소(http://localhost:4999/)로 호출 시 SearchError kind 'network' & 한국어 메시지 & 주소 미포함
  const origEnvUrl = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  try {
    process.env.NEXT_PUBLIC_GRAPHQL_API_URL = 'http://localhost:4999/';
    await searchConceptCards('Zustand');
    console.error('❌ 7. 잘못된 포트(4999)로의 요청이 성공함');
    failed = true;
  } catch (err) {
    if (err instanceof SearchError && err.kind === 'network') {
      const containsUrl =
        err.message.includes('4999') || err.message.includes('localhost');
      if (!containsUrl && /[가-힣]/.test(err.message)) {
        console.log(
          `✓ 7. 네트워크 에러 정상 발생 (kind: 'network', 한국어 메시지, 주소 미포함: "${err.message}")`
        );
      } else {
        console.error(
          `❌ 7. 네트워크 에러 메시지 규칙 위반 (주소 포함 또는 한국어 아님): "${err.message}"`
        );
        failed = true;
      }
    } else {
      console.error('❌ 7. SearchError kind network가 아님:', err);
      failed = true;
    }
  } finally {
    if (origEnvUrl !== undefined) {
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL = origEnvUrl;
    } else {
      delete process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
    }
  }

  // 8. NODE_ENV='production', 환경변수 비움 상태에서 호출 시 kind 'config'
  const envMap = process.env as Record<string, string | undefined>;
  const origNodeEnv = envMap.NODE_ENV;
  const origEnvUrl2 = process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
  try {
    envMap.NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
    await searchConceptCards('Zustand');
    console.error('❌ 8. 프로덕션 환경변수 누락 시 예외가 발생하지 않음');
    failed = true;
  } catch (err) {
    if (err instanceof SearchError && err.kind === 'config') {
      console.log(
        `✓ 8. 프로덕션 환경변수 미설정 시 SearchError(kind: 'config') 정상 발생: "${err.message}"`
      );
    } else {
      console.error('❌ 8. SearchError kind config가 아님:', err);
      failed = true;
    }
  } finally {
    envMap.NODE_ENV = origNodeEnv;
    if (origEnvUrl2 !== undefined) {
      process.env.NEXT_PUBLIC_GRAPHQL_API_URL = origEnvUrl2;
    } else {
      delete process.env.NEXT_PUBLIC_GRAPHQL_API_URL;
    }
  }

  if (failed) {
    console.error('\n🚨 verify-search-client 검증 중 오류가 발생했습니다.');
    process.exit(1);
  } else {
    console.log('\n🎉 [verify-search-client 통과] 모든 검색 클라이언트 검증을 통과했습니다!');
  }
}

main().catch((err) => {
  console.error('스크립트 실행 오류:', err);
  process.exit(1);
});
