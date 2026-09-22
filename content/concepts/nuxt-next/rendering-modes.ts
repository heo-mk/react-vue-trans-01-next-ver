import { ConceptPage } from '../../schema';

export const renderingModes: ConceptPage = {
  slug: 'rendering-modes',
  axis: 'nuxt-next',
  title: '서버 렌더링 모델 (Next.js RSC vs Nuxt 3 Universal)',
  oneLineSummary:
    'Next.js는 컴포넌트 단위로 서버에서만 실행할 부품과 브라우저에서 실행할 부품을 세밀하게 쪼개고, Nuxt 3는 페이지 전체를 서버에서 먼저 그린 뒤 브라우저에 배달해 생명력을 불어넣는(Hydration) 방식을 기본으로 채택합니다.',
  analogy:
    'Next.js RSC는 완성된 프라모델 완제품(서버 컴포넌트) 사이에 사용자가 직접 조작할 움직이는 모터(클라이언트 컴포넌트)만 부분 결합해 납품하는 방식이고, Nuxt Universal은 전체 조립 키트를 먼저 서버에서 사진 찍어 보여준 후 브라우저에서 전체 부품을 한꺼번에 조립해 작동시키는 방식입니다.',
  comparisonTable: [
    {
      label: '기본 컴포넌트 성격',
      left: "서버 컴포넌트(Server Component) 기본. 클라이언트 동작이 필요할 때만 최상단에 'use client' 명시",
      right:
        '유니버설 컴포넌트(Universal) 기본. 동일한 컴포넌트 코드가 서버(SSR)와 브라우저(Hydration) 양쪽에서 모두 실행',
    },
    {
      label: '클라이언트 번들 크기',
      left: '서버 전용 컴포넌트의 자바스크립트 코드와 무거운 라이브러리는 브라우저 번들에 아예 포함되지 않음 (Zero-Bundle-Size)',
      right:
        '컴포넌트 템플릿과 런타임 코드가 브라우저로 전송되어 하이드레이션됨 (Island Architecture 또는 .client 컴포넌트로 분리 가능)',
    },
    {
      label: '비동기 데이터 페칭',
      left: 'async/await를 컴포넌트 본문에서 직접 호출 (`async function Page() { const data = await db.query(); }`)',
      right:
        "컴포저블 사용 (`const { data } = await useFetch('/api/posts')`). 서버와 클라이언트 간 자동 캐시 직렬화(Payload)",
    },
    {
      label: '서버 엔진 아키텍처',
      left: 'Next.js 독자 서버 런타임 (Node.js 또는 Edge Runtime 환경 명시)',
      right:
        'Nitro 엔진 기반 — 설정 한 줄로 Cloudflare Workers, AWS Lambda, Vercel, Node 등 20+ 플랫폼 크로스 배포',
    },
  ],
  codeExamples: [
    {
      label: '기초 예제',
      version: 'Next.js 15+ (App Router) vs Nuxt 3.14+ (Nitro)',
      leftCode: `// [Next.js App Router] app/posts/page.tsx (기본 Server Component)
// 서버 전용 데이터베이스를 직접 쿼리 가능 (클라이언트로 코드 유출 없음)
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
// useFetch는 서버에서 실행 후 결과를 직렬화하여 클라이언트 Hydration 시 중복 호출 방지
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
      sourceProject: 'Global Tech Blog Platform',
      leftCode: `// [Next.js] 실전 Server Action을 통한 양방향 서버 통신
// app/actions/createPost.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
  // 태그 또는 경로 기반 정적 캐시 즉각 재검증
  revalidatePath('/posts');
}`,
      rightCode: `// [Nuxt 3] Nitro 독립 서버 핸들러 + 클라이언트 $fetch 통신
// server/api/posts.post.ts (Nitro Server Route)
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const newPost = await db.post.create({ data: { title: body.title } });
  return newPost;
});

// pages/posts/create.vue
const submit = async () => {
  await $fetch('/api/posts', { method: 'POST', body: { title: title.value } });
  await refreshNuxtData('posts'); // 캐시 재검증 트리거
};`,
    },
  ],
  diagramId: 'rendering-modes-diagram',
  pitfalls: [
    {
      question:
        "Next.js App Router에서 컴포넌트 상단에 'use client'를 선언하면, 이 컴포넌트는 서버에서 전혀 실행되지 않고 브라우저에서만 렌더링되나요?",
      answer:
        '흔히 하는 착각입니다. \'use client\'는 "브라우저 전용 렌더링(CSR)"을 뜻하는 것이 아니라, "클라이언트 번들에 포함되어 리액트 훅(useState, useEffect)과 이벤트 리스너를 사용할 수 있는 클라이언트 컴포넌트 경계(Boundary)"를 선언하는 것입니다. 초기 페이지 요청 시 \'use client\' 컴포넌트 역시 서버에서 HTML로 사전 렌더링(SSR)된 후 브라우저로 전송되어 하이드레이션됩니다. 따라서 window나 document 등 브라우저 전용 객체에 렌더 본문에서 직접 접근하면 서버 에러가 발생합니다.',
    },
    {
      question:
        'Nuxt 3에서 useAsyncData나 useFetch 없이 일반 axios/fetch를 컴포넌트 <script setup> 본문에서 직접 호출하면 어떤 문제가 생기나요?',
      answer:
        '일반 fetch를 쓰면 서버에서 초기 HTML을 만들 때 한 번 호출되고, 브라우저가 HTML을 받아 Hydration을 수행할 때 클라이언트에서 또 한 번 호출되는 "이중 네트워크 요청(Double Fetching)" 현상이 발생합니다. 또한 서버가 가져온 응답과 클라이언트가 다시 가져온 응답의 시점이 달라 상태 불일치(Hydration Mismatch) 경고가 발생할 수 있습니다. Nuxt의 useFetch는 서버 응답을 페이로드에 직렬화하여 클라이언트가 그대로 재사용하므로 중복 요청과 불일치를 완벽히 방지합니다.',
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
  ],
};
