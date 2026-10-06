# React ↔ Vue 전환 학습 사이트

**배포** https://react-vue-trans-edu.vercel.app/

**API** https://react-vue-trans-api.vercel.app/

&nbsp;

&nbsp;

![서버 상태 관리 페이지](docs/images/01-hero.png)

&nbsp;

&nbsp;

<table>
  <tr>
    <td><img src="docs/images/02-dark-diagram.png" alt="상태 관리 구조도 (다크 모드)" width="520"></td>
    <td><img src="docs/images/03-mobile.png" alt="모바일 화면 (375px)" width="200"></td>
  </tr>
</table>

&nbsp;

&nbsp;

## 소개

1\. React와 Vue의 차이를 개념 단위로 대조하는 학습 사이트

&nbsp;

&nbsp;

2\. 한쪽 프레임워크에 익숙한 개발자가 다른 쪽으로 넘어갈 때 생기는 개념 공백을 줄이는 것이 목표

&nbsp;

&nbsp;

3\. 한 저장소 안에서 Next.js 프론트엔드와 GraphQL API를 폴더로 나눠 관리(pnpm 모노레포)하고 Vercel에 각각 배포

&nbsp;

&nbsp;

## 무엇을 다루나

1\. 3개 전환 축에서 5개 개념을 정리

| 전환 축 | 개념 수 |
| --- | --- |
| React ↔ Vue | 3 |
| Vue 2 → Vue 3 | 1 |
| Nuxt 3 ↔ Next.js | 1 |

&nbsp;

&nbsp;

2\. 개념 페이지 구성

- 핵심 요약과 직관적 비유

- 구조 다이어그램 (다크/라이트 테마에 맞춰 색이 바뀌고, 모바일용 세로 버전이 따로 있음)

- 핵심 차이 비교표

- React/Vue 코드 대조

- 실전 함정 Q&A

- 공식 문서 출처

&nbsp;

&nbsp;

3\. 규모: 비교 항목 25개, 코드 대조 16세트, 함정 Q&A 23개, 공식 문서 출처 11건

&nbsp;

&nbsp;

4\. 내용 기준 버전: React 18+, Vue 3.4+, Nuxt 3, Next.js 15 이하

&nbsp;

&nbsp;

5\. 부가 기능: 개념 검색(GraphQL), 학습 완료 표시·북마크·진도율(브라우저에 저장), 다크/라이트 테마, 모바일 대응

&nbsp;

&nbsp;

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| 프론트엔드 (`apps/web`) | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Zustand 5 |
| API (`apps/api`) | Express 5, Apollo Server 5, graphql 16, ESM |
| 공유 타입 (`packages/schema`) | 타입 정의만 포함 |
| 도구 | pnpm 워크스페이스, Mermaid CLI(다이어그램 생성), Puppeteer(브라우저 검증), ESLint |
| 배포 | Vercel (web, api 두 프로젝트) |

&nbsp;

&nbsp;

## 저장소 구조

```text
apps/
  web/                 Next.js 프론트엔드 (포트 3000)
    app/               페이지: /, /react-vue/[concept], /vue2-vue3/[concept], /nuxt-next/[concept]
    components/        검색창, 진도 대시보드, 개념 화면, 다이어그램 컴포넌트
    lib/graphql/       GraphQL 쿼리 요청문, 클라이언트, 어댑터(응답을 화면용으로 변환), 로더(서버용), 검색 클라이언트(브라우저용)
    store/, styles/    Zustand 스토어, 디자인 토큰
    content/diagrams/  Mermaid 원본(.mmd)
    public/diagrams/   미리 만들어 둔 SVG (배포에서는 이것을 그대로 사용)
    scripts/           다이어그램 생성, 화면 문구 검사, 어댑터·검색 검증 스크립트
  api/                 GraphQL 서버 (포트 4000)
    src/               스키마(물어볼 수 있는 목록), 리졸버(각 질문에 답을 채우는 함수), 검색, 서버 시작 파일
    src/content/       개념 데이터 (concepts/*.ts)
    scripts/           API 응답 검증, 검색 검증, 콘텐츠 품질 검사
packages/
  schema/              공유 타입 (schema.ts)
```

&nbsp;

&nbsp;

### 의존 규칙

1\. `web`과 `api`가 함께 쓰는 것은 `schema`의 타입(데이터 모양 정의)뿐 (`import type`으로 가져옴)

&nbsp;

&nbsp;

2\. `web`의 화면 코드(`app/`, `components/`, `lib/`, `store/`)는 `api` 코드를 가져다 쓸 수 없음 (ESLint `no-restricted-imports` 규칙이 오류로 막음, `apps/web/eslint.config.mjs`)

&nbsp;

&nbsp;

3\. `api`와 `schema`는 `web`을 import하지 않음

&nbsp;

&nbsp;

4\. 검증 스크립트의 기대값은 `api`의 원본 데이터에서 가져옴 (개념 문구를 고치는 곳이 한 곳이라 기대값이 어긋나지 않음)

&nbsp;

&nbsp;

### 데이터 흐름

1\. 빌드: `pnpm run build`가 `api`를 켜고 `next build`로 정적 페이지(미리 완성해 두는 페이지) 9개를 만든 뒤 `api`를 끔

&nbsp;

&nbsp;

2\. 실행: 만들어진 사이트는 `api` 없이 뜨고, 없는 주소는 바로 404(페이지 없음)

&nbsp;

&nbsp;

3\. 검색: 브라우저가 `api`를 직접 호출

&nbsp;

&nbsp;

## GraphQL

1\. Query 필드는 4개

| 필드 | 용도 |
| --- | --- |
| `axes` | 전환 축 목록 |
| `concepts(axis)` | 축별 개념 목록 |
| `concept(axis, slug)` | 개념 상세 |
| `search(query)` | 개념 검색 |

&nbsp;

&nbsp;

2\. `axis` 값은 `REACT_VUE`, `VUE2_VUE3`, `NUXT_NEXT`

&nbsp;

&nbsp;

3\. web은 위 필드를 5개의 요청문(쿼리 문서)으로 호출: `AxesQuery`, `ConceptCardsQuery`, `ConceptParamsQuery`, `ConceptDetailQuery`, `SearchQuery`

&nbsp;

&nbsp;

4\. 응답은 `lib/graphql/adapter.ts`에서 화면용 형태로 변환

```graphql
query Search($q: String!) {
  search(query: $q) { slug }
}
```

&nbsp;

&nbsp;

## 시작하기

1\. 사전 준비

1\) pnpm 10.19.0 사용 (`package.json`의 `packageManager`로 지정)

2\) Node.js는 `engines`를 지정하지 않았고, 개발은 22.x에서 진행

3\) 전역 pnpm이 11.x여도 저장소 안에서는 지정된 10.19.0이 실행되며, 이때 `The "pnpm" field in package.json is no longer read by pnpm` 경고가 한 줄 나올 수 있음

&nbsp;

&nbsp;

2\. 설치

```bash
pnpm install
```

&nbsp;

&nbsp;

3\. 개발 서버 실행: `api`(4000)와 `web`(3000)을 함께 켜며, 다이어그램을 먼저 만들기 때문에 `web`이 뜨기까지 20초쯤 걸림. 끝나면 http://localhost:3000 에서 확인

```bash
pnpm run dev:all
```

&nbsp;

&nbsp;

4\. 배포용 페이지 빌드: `api`를 자동으로 켜고 끈 뒤 정적 페이지를 생성

```bash
pnpm run build
```

&nbsp;

&nbsp;

## 환경변수

예시 파일은 `apps/web/.env.example`에 있습니다.

&nbsp;

&nbsp;

| 이름 | 위치 | 설명 |
| --- | --- | --- |
| `GRAPHQL_API_URL` | web | 서버(빌드)에서 `api`를 호출할 주소. 설정하지 않으면 `http://localhost:4000/`을 사용합니다 |
| `NEXT_PUBLIC_GRAPHQL_API_URL` | web | 브라우저 검색이 호출할 주소. 빌드할 때 값이 코드 안에 고정되므로 값을 바꾸면 다시 배포해야 합니다. 개발 기본값은 `http://localhost:4000/` 이고, 배포용(production) 빌드에서 설정하지 않으면 `localhost`를 넣지 않고 설정 오류를 표시합니다 |
| `CORS_ORIGINS` | api | 허용할 출처 목록(쉼표 구분, 끝에 슬래시 없이). 설정하지 않으면 모든 출처를 허용합니다 |

&nbsp;

&nbsp;

## 검증 명령

별도 테스트 프레임워크 대신 검증 스크립트를 사용합니다. 모두 저장소 루트에서 실행합니다.

&nbsp;

&nbsp;

| 명령 | 확인하는 것 |
| --- | --- |
| `pnpm run check:all` | 콘텐츠 검사(`check:content`)와 화면 문구 검사(`check:web-copy`) |
| `pnpm run lint` | web의 ESLint (의존 규칙 포함). 현재 오류 0건, 경고 1건(`DiagramSvg.tsx`의 사용하지 않는 변수 `defaultSvg`) |
| `pnpm run smoke:api` | API 응답 검증 (없는 검색어, 앞뒤 공백, 요청한 필드만 반환 등) |
| `pnpm run test:search` | 여러 검색어(`useState`, `ref`, `Zustand` 등)의 검색 결과(건수, slug)를 출력 |
| `pnpm run verify:adapter` | 어댑터 결과가 원본 데이터와 같은지 |
| `pnpm run verify:search-client` | 검색 요청 코드(`searchClient`) 검증: 검색 결과(slug, 축 이름), 요청 취소, 네트워크 오류 메시지, 설정 누락 시 오류 |
| `pnpm run verify:search-ui` | 브라우저를 띄워 검색 화면을 자동 검사 (실행 전에 3000, 4000 포트가 비어 있어야 함) |

&nbsp;

&nbsp;

`lint`, `smoke:api`, `test:search`, `verify:search-client`는 서버를 켜지 않은 상태에서 실행해 통과를 확인했습니다.

&nbsp;

&nbsp;

## 다이어그램 작업 규칙

1\. `apps/web/content/diagrams/*.mmd`를 수정

&nbsp;

&nbsp;

2\. `pnpm run build:diagrams` (또는 `pnpm run dev:all`)로 SVG를 다시 생성

&nbsp;

&nbsp;

3\. 바뀐 `apps/web/public/diagrams/*.svg`까지 **함께 커밋**

&nbsp;

&nbsp;

4\. 이유: 배포 서버(Vercel)에는 SVG 변환에 필요한 브라우저 라이브러리가 없어서, 배포 빌드는 변환하지 않고 저장소의 SVG를 그대로 사용

&nbsp;

&nbsp;

5\. 주의: SVG를 커밋하지 않으면 빌드는 오류 없이 통과하지만 배포 화면에는 옛 그림이 그대로 나옴

&nbsp;

&nbsp;

## 배포

1\. `web`과 `api`를 별도 Vercel 프로젝트로 배포

| 프로젝트 | Root Directory (프로젝트 기준 폴더) | 비고 |
| --- | --- | --- |
| api | `apps/api` | `CORS_ORIGINS`에 web 주소 설정 |
| web | `apps/web` | 빌드 명령 `build:next`, 환경변수 2개 설정 |

&nbsp;

&nbsp;

2\. 배포 순서: web 빌드가 `api`를 호출해 페이지를 만들기 때문에 api 먼저 배포 → web 환경변수 설정 → `CORS_ORIGINS`로 허용 출처 제한
