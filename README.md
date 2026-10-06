# React ↔ Vue 전환 학습 사이트

**배포** https://react-vue-trans-edu.vercel.app/

**API** https://react-vue-trans-api.vercel.app/

<img width="1260" height="972" alt="01" src="https://github.com/user-attachments/assets/46b5866f-b846-4495-b146-ad6f2a685724" />
<img width="1344" height="977" alt="02" src="https://github.com/user-attachments/assets/590d467d-298f-4a1d-99e4-120a69a6b6a2" />
<img width="1265" height="641" alt="03" src="https://github.com/user-attachments/assets/6f30d0f3-1ff6-4b43-85a8-0bfeb34f8666" />
<img width="1209" height="980" alt="04" src="https://github.com/user-attachments/assets/b5f140c0-099b-4cff-8c14-ddea42afe929" />
<img width="1360" height="648" alt="04-1" src="https://github.com/user-attachments/assets/f825989d-be34-42ee-9fb7-958b78d23d78" />
<img width="1223" height="919" alt="05" src="https://github.com/user-attachments/assets/b7d44da5-aca3-4122-b578-139a005c4727" />
<img width="1207" height="980" alt="06" src="https://github.com/user-attachments/assets/99a66a28-efea-41dc-9a49-443028244f9b" />
<img width="1158" height="962" alt="07" src="https://github.com/user-attachments/assets/92329d26-a768-4322-96de-8fb7be5fa666" />
<img width="329" height="714" alt="08" src="https://github.com/user-attachments/assets/fa00ddee-6827-4b2c-86a9-582944dade4f" />
<img width="387" height="848" alt="09" src="https://github.com/user-attachments/assets/cf7c6fff-9ae9-4589-a7ec-5ff519ac528c" />
<img width="392" height="829" alt="10" src="https://github.com/user-attachments/assets/8261c3d4-a945-4c8b-b58e-4c88b15f6916" />
<img width="693" height="435" alt="11" src="https://github.com/user-attachments/assets/18afba69-33f1-42e3-86de-01c65ac09faf" />

## 소개

1. React와 Vue의 차이를 개념 단위로 대조하는 학습 사이트

2. 한쪽 프레임워크에 익숙한 개발자가 다른 쪽으로 넘어갈 때 생기는 개념 공백을 줄이는 것이 목표

3. 한 저장소 안에서 Next.js 프론트엔드와 GraphQL API를 폴더로 나눠 관리(pnpm 모노레포)하고 Vercel에 각각 배포

## 무엇을 다루나

1. 3개 전환 축에서 5개 개념을 정리

   | 전환 축 | 개념 수 |
   | --- | --- |
   | React ↔ Vue | 3 |
   | Vue 2 → Vue 3 | 1 |
   | Nuxt 3 ↔ Next.js | 1 |

2. 개념 페이지 구성

   - 핵심 요약과 직관적 비유

   - 구조 다이어그램 (다크/라이트 테마에 맞춰 색이 바뀌고, 모바일용 세로 버전이 따로 있음)

   - 핵심 차이 비교표

   - React/Vue 코드 대조

   - 실전 함정 Q&A

   - 공식 문서 출처

3. 규모: 비교 항목 25개, 코드 대조 16세트, 함정 Q&A 23개, 공식 문서 출처 11건

4. 내용 기준 버전: React 18+, Vue 3.4+, Nuxt 3, Next.js 15 이하

5. 부가 기능: 개념 검색(GraphQL), 학습 완료 표시·북마크·진도율(브라우저에 저장), 다크/라이트 테마, 모바일 대응

## 역할

1인 개발 프로젝트 (AI 도구 활용)

1. 기획: 전환 축 선정, 비교 항목·함정 Q&A의 기획과 검수를 직접 수행

2. 설계: 프론트엔드(Next.js, React, Zustand)의 구조·로직과, 한 저장소를 web / api / 공유 타입(schema) 폴더로 나누는 구조·데이터 흐름을 직접 설계

3. 구현(AI에 위임): AI 코딩 에이전트(지시를 받아 코드를 작성·수정하는 AI 개발 도구)인 AntiGravity와 Claude Code에 설계를 지시해 코드를 작성하게 함

4. 검증(직접): 에이전트가 낸 결과는 코드 검사·빌드·검증 스크립트를 직접 실행하고 화면을 확인해, 문제를 찾아 수정 지시

5. 백엔드(Express, Apollo Server): 결과물을 검토하며 로직 파악

## 기술 스택

1. 프론트엔드: Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Zustand 5

2. API: Express 5, Apollo Server 5, graphql 16 (ESM)

3. 도구·배포: pnpm 워크스페이스, Mermaid CLI, Puppeteer, ESLint, Vercel

4. AI 개발 도구: AntiGravity · Claude Code

## 기술적 의사결정

1. **배포 서버에서는 그림 변환을 하지 않고, 미리 만들어 둔 SVG를 그대로 사용**

   1) 배경: 다이어그램(Mermaid)을 SVG 그림으로 바꾸는 도구가 배포 서버(Vercel)에서 실행되지 않음 (이 도구는 브라우저를 띄우는데, 서버에 브라우저용 라이브러리 `libnspr4.so`가 없음)

   2) 선택: AI와 대안 3가지(서버리스 Chromium · 브라우저에서 실시간 렌더링 · 사전 생성)를 비교해, 바뀌지 않는 그림 10개라는 점을 근거로 사전 생성 선택

   3) 결과: 배포 빌드 통과, 정상 운영 (대가: 원본을 고치면 SVG도 함께 저장소에 올려야 함)

2. **검색 결과 박스를 헤더 안에서 꺼내 화면 맨 바깥에 따로 그림(React 포털 기능)**

   1) 배경: 모바일에서 헤더가 떨리는 문제를 고치려고 건 설정(`contain: paint`)이 "헤더 밖으로 삐져나온 부분은 그리지 않는" 성격이라, 헤더 아래로 펼쳐지는 검색 결과 박스가 위쪽 일부만 보이고 잘림

   2) 선택: 떨림 수정은 유지하고 박스만 헤더 밖(`body`)으로 꺼냄, 헤더 기준이 사라진 만큼 입력창 위치를 계산해 맞추고 375px 화면에서도 밖으로 나가지 않게 보정

   3) 결과: 박스 전체가 표시되는 것을 화면에서 확인

3. **검색 결과 목록에서 방향키로 첫 번째 항목을 고르면, 목록을 맨 위로 되돌려 제목 줄이 가려지지 않게 함**

   1) 배경: 검색창에 입력하면 나오는 결과 목록에서 방향키로 항목을 고르면 선택한 항목이 박스 안에 보이도록 목록이 자동으로 스크롤되는데, 첫 번째 항목을 고르면 그 위의 제목 줄('검색 결과 N건')이 박스 위쪽으로 밀려 사라짐

   2) 선택: 첫 번째 항목일 때만 목록을 맨 위까지 되돌려 제목 줄까지 보이게 하고, 나머지 항목은 기존대로 필요한 만큼만 스크롤

   3) 결과: 첫 번째 항목을 골라도 제목 줄이 그대로 보임

4. **화면 코드가 서버(api) 코드를 가져다 쓰지 못하게 ESLint 규칙으로 막음**

   1) 배경: 화면(web)과 서버(api)가 한 저장소에 있어, 화면 코드가 서버 코드를 직접 가져다 쓸 수 있는 구조

   2) 선택: 둘이 같이 쓰는 것은 타입 정의(`schema`)뿐으로 한정하고, 화면 코드가 서버 코드를 가져오면 오류가 나도록 ESLint 규칙(`no-restricted-imports`) 설정

   3) 결과: 일부러 위반해 오류로 차단되는 것까지 확인

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

### 의존 규칙

1. `web`과 `api`가 함께 쓰는 것은 `schema`의 타입(데이터 모양 정의)뿐 (`import type`으로 가져옴)

2. `web`의 화면 코드(`app/`, `components/`, `lib/`, `store/`)는 `api` 코드를 가져다 쓸 수 없음 (ESLint `no-restricted-imports` 규칙이 오류로 막음, `apps/web/eslint.config.mjs`)

3. `api`와 `schema`는 `web`을 import하지 않음

4. 검증 스크립트의 기대값은 `api`의 원본 데이터에서 가져옴 (개념 문구를 고치는 곳이 한 곳이라 기대값이 어긋나지 않음)

### 데이터 흐름

1. 빌드: `pnpm run build`가 `api`를 켜고 `next build`로 정적 페이지(미리 완성해 두는 페이지) 9개를 만든 뒤 `api`를 끔

2. 실행: 만들어진 사이트는 `api` 없이 뜨고, 없는 주소는 바로 404(페이지 없음)

3. 검색: 브라우저가 `api`를 직접 호출

## GraphQL

1. Query 필드는 4개

   | 필드 | 용도 |
   | --- | --- |
   | `axes` | 전환 축 목록 |
   | `concepts(axis)` | 축별 개념 목록 |
   | `concept(axis, slug)` | 개념 상세 |
   | `search(query)` | 개념 검색 |

2. `axis` 값은 `REACT_VUE`, `VUE2_VUE3`, `NUXT_NEXT`

3. web은 위 필드를 5개의 요청문(쿼리 문서)으로 호출: `AxesQuery`, `ConceptCardsQuery`, `ConceptParamsQuery`, `ConceptDetailQuery`, `SearchQuery`

4. 응답은 `lib/graphql/adapter.ts`에서 화면용 형태로 변환

```graphql
query Search($q: String!) {
  search(query: $q) { slug }
}
```

## 시작하기

1. 사전 준비

   1) pnpm 10.19.0 사용 (`package.json`의 `packageManager`로 지정)

   2) Node.js는 `engines`를 지정하지 않았고, 개발은 22.x에서 진행

   3) 전역 pnpm이 11.x여도 저장소 안에서는 지정된 10.19.0이 실행되며, 이때 `The "pnpm" field in package.json is no longer read by pnpm` 경고가 한 줄 나올 수 있음

2. 설치

   ```bash
   pnpm install
   ```

3. 개발 서버 실행: `api`(4000)와 `web`(3000)을 함께 켜며, 다이어그램을 먼저 만들기 때문에 `web`이 뜨기까지 20초쯤 걸림. 끝나면 http://localhost:3000 에서 확인

   ```bash
   pnpm run dev:all
   ```

4. 배포용 페이지 빌드: `api`를 자동으로 켜고 끈 뒤 정적 페이지를 생성

   ```bash
   pnpm run build
   ```

## 환경변수

예시 파일은 `apps/web/.env.example`에 있습니다.

| 이름 | 위치 | 설명 |
| --- | --- | --- |
| `GRAPHQL_API_URL` | web | 서버(빌드)에서 `api`를 호출할 주소. 설정하지 않으면 `http://localhost:4000/`을 사용합니다 |
| `NEXT_PUBLIC_GRAPHQL_API_URL` | web | 브라우저 검색이 호출할 주소. 빌드할 때 값이 코드 안에 고정되므로 값을 바꾸면 다시 배포해야 합니다. 개발 기본값은 `http://localhost:4000/` 이고, 배포용(production) 빌드에서 설정하지 않으면 `localhost`를 넣지 않고 설정 오류를 표시합니다 |
| `CORS_ORIGINS` | api | 허용할 출처 목록(쉼표 구분, 끝에 슬래시 없이). 설정하지 않으면 모든 출처를 허용합니다 |

## 검증 명령

별도 테스트 프레임워크 대신 검증 스크립트를 사용합니다. 모두 저장소 루트에서 실행합니다.

| 명령 | 확인하는 것 |
| --- | --- |
| `pnpm run check:all` | 콘텐츠 검사(`check:content`)와 화면 문구 검사(`check:web-copy`) |
| `pnpm run lint` | web의 ESLint (의존 규칙 포함). 현재 오류 0건, 경고 1건(`DiagramSvg.tsx`의 사용하지 않는 변수 `defaultSvg`) |
| `pnpm run smoke:api` | API 응답 검증 (없는 검색어, 앞뒤 공백, 요청한 필드만 반환 등) |
| `pnpm run test:search` | 여러 검색어(`useState`, `ref`, `Zustand` 등)의 검색 결과(건수, slug)를 출력 |
| `pnpm run verify:adapter` | 어댑터 결과가 원본 데이터와 같은지 |
| `pnpm run verify:search-client` | 검색 요청 코드(`searchClient`) 검증: 검색 결과(slug, 축 이름), 요청 취소, 네트워크 오류 메시지, 설정 누락 시 오류 |
| `pnpm run verify:search-ui` | 브라우저를 띄워 검색 화면을 자동 검사 (실행 전에 3000, 4000 포트가 비어 있어야 함) |

`lint`, `smoke:api`, `test:search`, `verify:search-client`는 서버를 켜지 않은 상태에서 실행해 통과를 확인했습니다.

## 다이어그램 작업 규칙

1. `apps/web/content/diagrams/*.mmd`를 수정

2. `pnpm run build:diagrams` (또는 `pnpm run dev:all`)로 SVG를 다시 생성

3. 바뀐 `apps/web/public/diagrams/*.svg`까지 **함께 커밋**

4. 이유: 배포 서버(Vercel)에는 SVG 변환에 필요한 브라우저 라이브러리가 없어서, 배포 빌드는 변환하지 않고 저장소의 SVG를 그대로 사용

5. 주의: SVG를 커밋하지 않으면 빌드는 오류 없이 통과하지만 배포 화면에는 옛 그림이 그대로 나옴

## 배포

1. `web`과 `api`를 별도 Vercel 프로젝트로 배포

   | 프로젝트 | Root Directory (프로젝트 기준 폴더) | 비고 |
   | --- | --- | --- |
   | api | `apps/api` | `CORS_ORIGINS`에 web 주소 설정 |
   | web | `apps/web` | 빌드 명령 `build:next`, 환경변수 2개 설정 |

2. 배포 순서: web 빌드가 `api`를 호출해 페이지를 만들기 때문에 api 먼저 배포 → web 환경변수 설정 → `CORS_ORIGINS`로 허용 출처 제한
