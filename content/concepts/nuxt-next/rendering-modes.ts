import { ConceptPage } from '../../schema';

export const renderingModes: ConceptPage = {
  slug: 'rendering-modes',
  axis: 'nuxt-next',
  title: '풀스택 메타 프레임워크 아키텍처 (Next.js vs Nuxt 3)',
  oneLineSummary:
    'Next.js는 컴포넌트 단위로 서버와 브라우저 부품을 세밀하게 분리하고, Nuxt 3는 강력한 Nitro 엔진과 직관적인 설정(routeRules)으로 어디서든 유연하게 동작하는 풀스택 환경을 제공합니다.',
  analogy:
    'Next.js RSC는 완제품 로봇 사이에 사용자가 누를 버튼(클라이언트 컴포넌트)만 콕 집어 끼워 넣는 정밀 조립 라인이고, Nuxt 3는 전 세계 모든 콘센트 규격(Node, Cloudflare, Vercel)에 자동으로 맞춰지는 만능 여행용 변환 어댑터(Nitro)를 장착한 여행 키트입니다.',
  sourceNote: '02_두번째 보고서 7장 "Nuxt3 ↔ Next.js 전환 가이드" 인용',
  comparisonTable: [
    {
      label: '기본 렌더링 모델',
      left: "React 서버 컴포넌트(RSC) 기본 — 서버 컴포넌트는 자바스크립트 번들 0바이트, 상호작용 필요 시 'use client' 명시",
      right:
        '유니버설 렌더링(Universal) 기본 — 서버(SSR)에서 생성된 HTML이 브라우저에서 하이드레이션(Hydration)되어 인터랙션 활성화',
    },
    {
      label: '서버 런타임 엔진',
      left: 'Next.js 독자 서버 환경 (Node.js 또는 Edge Runtime 지정)',
      right:
        'Nitro 서버 엔진 내장 — 설정 하나로 Node, Cloudflare Workers, AWS Lambda, Vercel 등 20+ 배포 환경 크로스 컴파일',
    },
    {
      label: '데이터 페칭 및 직렬화',
      left: '서버 컴포넌트 본문에서 async/await fetch 직접 호출 (별도 훅 불필요)',
      right:
        'useFetch, useAsyncData 컴포저블 사용 — 서버 응답을 페이로드로 자동 직렬화하여 하이드레이션 시 중복 호출 방지',
    },
    {
      label: '컴포넌트 가져오기',
      left: '명시적 import 필수 (React 생태계 관례 준수)',
      right:
        'components/, composables/ 폴더 내 파일 자동 임포트(Auto-import) 기본 지원',
    },
    {
      label: '렌더링 규칙 지정',
      left: '각 페이지/컴포넌트 파일 단위로 분산 지정 (revalidate, dynamic)',
      right:
        'nuxt.config.ts의 routeRules 설정 하나로 라우트별 SSR, SSG, SWR, SPA를 중앙 집중 선언',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'Next.js 15+ (App Router) vs Nuxt 3.14+ (Nitro)',
      leftCode: `// [Next.js App Router] app/posts/page.tsx (기본 Server Component)
// 서버 전용 DB 쿼리 직접 실행 (클라이언트 번들로 코드 유출 없음)
import db from '@/lib/db';

export default async function PostsPage() {
  const posts = await db.post.findMany({ take: 5 });

  return (
    <main>
      <h1>최신 게시글 목록</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}`,
      rightCode: `<!-- [Nuxt 3] pages/posts.vue (Universal Component) -->
<script setup lang="ts">
// useFetch는 서버 실행 결과를 직렬화(Payload)하여 클라이언트 Hydration 시 중복 호출 방지
const { data: posts, status } = await useFetch('/api/posts', {
  lazy: false,
});
</script>

<template>
  <main>
    <h1>최신 게시글 목록</h1>
    <ul v-if="posts">
      <li v-for="post in posts" :key="post.id">{{ post.title }}</li>
    </ul>
    <div v-else-if="status === 'pending'">불러오는 중...</div>
  </main>
</template>`,
    },
    {
      label: '실전 예제',
      version: 'Next.js 15+ Server Action vs Nuxt 3 Nitro Server Route',
      sourceProject: 'Global Tech Blog Platform & 퇴직금 회수 가이드',
      leftCode: `// [Next.js] 실전 Server Action을 통한 안전한 서버 연동
// app/actions/createPost.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  // 경로 기반 정적 캐시 즉각 재검증
  revalidatePath('/posts');
}`,
      rightCode: `// [Nuxt 3] Nitro 독립 서버 핸들러 + 클라이언트 통신
// server/api/posts.post.ts (Nitro Server Route)
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const newPost = await db.post.create({ data: { title: body.title } });
  return newPost;
});

// pages/posts/create.vue
const submit = async () => {
  await $fetch('/api/posts', { method: 'POST', body: { title: title.value } });
  await refreshNuxtData('posts'); // 특정 키 캐시 무효화
};`,
    },
  ],
  diagramId: 'rendering-modes-diagram',
  pitfalls: [
    {
      question:
        "Next.js App Router에서 컴포넌트 상단에 'use client'를 선언하면, 이 컴포넌트는 서버에서 전혀 실행되지 않고 브라우저에서만 렌더링되나요?",
      answer:
        '흔히 하는 대표적인 착각입니다. \'use client\'는 "클라이언트 전용 렌더링(CSR)"을 뜻하는 것이 아니라, "클라이언트 번들에 포함되어 브라우저 API와 리액트 훅(useState, useEffect)을 사용할 수 있는 경계(Boundary)"를 지정하는 것입니다. 초기 페이지 요청 시 \'use client\' 컴포넌트 역시 서버에서 HTML로 사전 렌더링(SSR)된 후 브라우저로 전송되어 하이드레이션됩니다. 따라서 window나 localStorage 같은 브라우저 전용 객체에 렌더 본문에서 직접 접근하면 서버에서 ReferenceError가 발생합니다.',
    },
    {
      question:
        'Nuxt 3에서 useAsyncData나 useFetch 없이 일반 axios/fetch를 컴포넌트 본문에서 직접 호출하면 어떤 문제가 생기나요?',
      answer:
        '서버에서 초기 HTML을 렌더링할 때 한 번 호출되고, 브라우저가 HTML을 받아 Hydration을 수행할 때 클라이언트에서 또 한 번 호출되는 "이중 네트워크 요청(Double Fetching)" 현상이 발생합니다. 또한 서버 응답과 클라이언트 재요청 시점의 데이터가 미세하게 다를 경우 상태 불일치(Hydration Mismatch) 경고가 발생합니다. Nuxt의 useFetch는 서버 응답을 페이로드에 직렬화하여 클라이언트가 그대로 재사용하므로 중복 요청과 불일치를 완벽히 방지합니다.',
    },
  ],
  sources: [
    {
      label: 'Next.js 공식 문서 - Server and Client Components',
      url: 'https://nextjs.org/docs/app/building-your-application/rendering',
    },
    {
      label: 'Nuxt 3 공식 문서 - Rendering Modes & Nitro',
      url: 'https://nuxt.com/docs/guide/concepts/rendering',
    },
    {
      label: '02_두번째 보고서 7장 "Nuxt3 ↔ Next.js 전환 가이드"',
    },
  ],
};
