# React ↔ Vue 전환 학습 사이트 구축 문답 및 진행 내역 정리

본 문서는 **Phase 0부터 Phase 7까지**의 전체 프로젝트 구축 과정에서 진행된 모든 논의, 주요 이슈 분석, 사용자 문답 및 단계별 구현 결과를 체계적으로 정리한 기록입니다.

---

## 1. 주요 질의응답 (Q&A) 모음

### Q1. "pnpm으로 설정한 건지 확인해줘"
- **현황 확인**: 최초 `create-next-app` 실행 시 기본 옵션에 의해 `npm`(`package-lock.json`)으로 생성되어 있었습니다. 시스템에 이미 `pnpm` (v10.19.0)이 정상 설치되어 있음을 확인했습니다.
- **조치 결과**: 기존 `package-lock.json` 및 `node_modules`를 완전 삭제하고 `pnpm install`을 실행하여 `pnpm-lock.yaml` 생성 및 pnpm 기반으로 전면 전환했습니다.

---

### Q2. "git에 쌓인 걸로 보이는 changes가 엄청 많은데(10k) 이유 분석해줘"
- **원인 분석**:
  1. **패키지 락파일 교체 Diff (약 13,000줄 누적)**:
     `create-next-app`이 최초 생성 시 자동 커밋한 `package-lock.json`(-6,781줄) 삭제와 새로 생성된 `pnpm-lock.yaml`(+5,857줄)이 Git 변경 내역에 통째로 잡혔습니다.
  2. **Windows 환경의 `.gitignore` 선행 슬래시 문제**:
     기존 `.gitignore`에 `/node_modules`, `/.next/`처럼 루트 슬래시(`/`)가 포함되어 있어, Windows 환경의 VS Code/IDE Git 파일 감시자가 `node_modules` 내부의 수만 개 심링크 파일을 오인 감지하여 `10k+` 뱃지를 표시했습니다.
- **조치 결과**:
  1. `.gitignore`의 선행 슬래시를 제거하고 표준 디렉토리 규칙(`node_modules/`, `.next/` 등)으로 정돈했습니다.
  2. 중간 시행착오 커밋을 모두 리셋하고, 순수 구동 코드 23개 파일만 담긴 단 하나의 깔끔한 Initial Commit(`feat: initial project setup`)으로 저장소를 재정돈했습니다.

---

### Q3. "gitignore에 .agent 폴더도 제외해. 그리고 레포에 올라가 버려서 지웠으니 git 이력을 초기화하고 새로 시작하게 해줘."
- **조치 결과**:
  1. `.gitignore`에 `.agents/` 및 `.agent/` 폴더 제외 규칙을 영구 등록했습니다.
  2. 로컬 `.git` 디렉토리를 완전히 삭제한 뒤 `git init -b main`으로 재초기화했습니다.
  3. `.agents` 폴더가 완전히 배제된 상태에서 순수 애플리케이션 파일 22개만 스테이징하여 깨끗한 첫 커밋을 다시 생성했습니다.

---

### Q4. "docs 폴더는 github에 안 올라가게 해둔 거지?"
- **조치 결과**:
  1. 당시 로컬 커밋만 생성되고 아직 `git push`가 이루어지지 않은 안전한 상태였습니다.
  2. 즉시 `.gitignore`에 `docs/` 제외 규칙을 추가했습니다.
  3. `git rm -r --cached docs` 명령으로 Git 추적을 해제하고, `git commit --amend`를 통해 로컬 커밋 이력 자체에서도 `docs/` 기록을 완전히 소급 삭제했습니다.
  4. 로컬 디렉토리의 3개 원본 md 보고서는 안전하게 그대로 보존하면서, GitHub 원격 저장소에는 절대 업로드되지 않도록 완벽히 격리했습니다.

---

## 2. Phase별 구축 진행 내역 (Phase 0 ~ 7)

### Phase 0: 프로젝트 초기화
- **기술 스택**: Next.js 16 (App Router, no-src 루트 구조), TypeScript, Tailwind CSS v4, `pnpm`
- **의존성 설치**: `zustand`, `mermaid`, `@mermaid-js/mermaid-cli`, `prettier`, `prettier-plugin-tailwindcss`
- **스키마 정의**: [content/schema.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/content/schema.ts)에 `ConceptPage`, `ComparisonRow`, `CodeExample`, `Pitfall` 타입 선언
- **기본 검증**: `pnpm run lint` 및 `pnpm run build` 정상 통과

---

### Phase 1: 디자인 토큰 & 다크모드 체계
- **토큰 정의 ([styles/tokens.css](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/styles/tokens.css))**:
  - Vue 전용 토큰: `--diagram-vue-bg`, `--diagram-vue-border`, `--diagram-vue-text`
  - React 전용 토큰: `--diagram-react-bg`, `--diagram-react-border`, `--diagram-react-text`
  - 상태 토큰: `--diagram-warn-*`, `--diagram-ok-*`
  - 중립 단계 토큰: `--diagram-neutral-1` ~ `4`, `--diagram-text`, `--diagram-line`
- **Tailwind v4 연동 ([app/globals.css](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/app/globals.css))**:
  - `@custom-variant dark (&:where(.dark, .dark *));` 클래스 기반 다크모드
- **클라이언트 테마 동기화**:
  - [store/useUiStore.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/store/useUiStore.ts): Zustand `persist` 로컬스토리지 테마 영속화
  - [components/useIsMounted.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/useIsMounted.ts): React 19 권장 `useSyncExternalStore` 패턴으로 하이드레이션 깜빡임(FOUC) 방지
- **브라우저 검증**: 상단 토글 클릭 시 배경 및 다이어그램 토큰 색상이 실시간으로 부드럽게 전환됨 확인

---

### Phase 2: 콘텐츠 데이터 이관
- **원본 보고서 3종 통합 분석**:
  - `01_통합보고서.md` (감시와 알림, CCTV vs 초인종 비유, Hook 등록 시스템)
  - `02_두번째 보고서.md` (Vue2 defineProperty vs Vue3 Proxy 건물 경비원 비유, Nuxt3 Nitro vs Next App Router)
  - `3_학습노트.md` (실전 포트폴리오 3개 프로젝트: GitFind Dashboard, smartstore-item-finder, 퇴직금 회수 가이드)
- **3대 축 핵심 개념 구축**:
  1. `react-vue`: [reactivity-state.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/content/concepts/react-vue/reactivity-state.ts) (사고 전환의 출발점: 감시와 알림)
  2. `vue2-vue3`: [options-to-composition.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/content/concepts/vue2-vue3/options-to-composition.ts) (Options API → Composition API 마이그레이션)
  3. `nuxt-next`: [rendering-modes.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/content/concepts/nuxt-next/rendering-modes.ts) (풀스택 메타 프레임워크 아키텍처)
- **데이터 헬퍼**: [content/index.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/content/index.ts)에 `allConcepts`, `axisMetadata`, 축별 쿼리 함수 제공

---

### Phase 3: Mermaid → SVG 빌드 파이프라인
- **다이어그램 소스 ([content/diagrams/*.mmd](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/content/diagrams/))**:
  - `reactivity-diagram.mmd` (Vue 감시 vs React 알림 흐름도)
  - `composition-migration-diagram.mmd` (Options 파편화 → Composition 응집 구조도)
  - `rendering-modes-diagram.mmd` (Nuxt Nitro vs Next App Router 구조도)
- **빌드 스크립트 ([scripts/build-diagrams.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/scripts/build-diagrams.ts))**:
  - `mermaid-cli`(`mmdc`)로 투명 SVG 컴파일
  - `HEX_TO_CSS_VAR_MAP` 매핑 상수를 통해 SVG 내부의 고정 Hex 색상을 CSS 변수(`var(--diagram-*)`)로 자동 치환
  - `content/diagrams-manifest.json`에 인라인 맵 생성
- **Zero-Runtime 렌더러 ([components/diagram/DiagramSvg.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/diagram/DiagramSvg.tsx))**:
  - 클라이언트 번들 크기 0 증가로 순수 SVG 인라인 렌더링
  - 다크모드 전환 시 자바스크립트 재연산 없이 CSS 변수로 즉각 색상 전환 (DoD 달성)

---

### Phase 4: 라우팅 & 페이지 컴포넌트
- **공통 렌더링 컴포넌트**:
  - [ComparisonTable.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/content/ComparisonTable.tsx): 테두리와 구분선을 갖춘 반응형 비교표
  - [CodeExample.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/content/CodeExample.tsx): 버전 명시 배지, 실전 출처 배지, 좌우 2컬럼 비교 및 원클릭 복사
  - [PitfallCallout.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/content/PitfallCallout.tsx): 면접/학습 함정 Q&A 콜아웃 카드
  - [ConceptView.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/content/ConceptView.tsx): 개념 페이지 통합 조립 템플릿
- **세 축 동적 라우트 (100% SSG 정적 사전 생성)**:
  - `/app/react-vue/[concept]/page.tsx`
  - `/app/vue2-vue3/[concept]/page.tsx`
  - `/app/nuxt-next/[concept]/page.tsx`
- **글로벌 네비게이션 & 실시간 검색 ([components/Navbar.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/Navbar.tsx))**:
  - 키워드 입력 시 제목/요약/슬러그를 실시간 필터링하여 드롭다운 추천 및 즉시 이동

---

### Phase 5: 상태 관리 고도화
- **[ProgressDashboard.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/components/ProgressDashboard.tsx)**:
  - 학습 완료율 실시간 프로그레스 바 (완료 개념 수 / 총 개념 수 %)
  - 3단계 인터랙티브 필터 탭 (`전체`, `완료`, `즐겨찾기`)
  - 홈 화면([app/page.tsx](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/app/page.tsx)) 상단에 대시보드 배치
- **브라우저 영속성 검증**:
  - 개념 상세 페이지에서 토글한 상태가 홈 대시보드 프로그레스 바와 필터에 즉시 반영됨
  - 새로고침(F5) 후에도 `localStorage`에서 복원되어 영구 보존됨 확인

---

### Phase 6: 콘텐츠 품질 전수 체크
- **5대 지침 전수 감사**:
  1. 비교표 구분선 (4-4): 100% 충족
  2. 코드 예제 버전 명시 (4-6): 100% 충족 (`React 18+`, `Vue 3.4+` 등)
  3. Vue2 → Vue3 단방향성: Options API → Composition API 엄수
  4. 인용 표현 출처 명시 (3-6): 독창적 비유에 `sourceNote` 기재 완료
  5. 전문 용어 뜻풀이 (3-5): Proxy, Closure, Hydration, RSC 등 해설 포함
- **자동화 감사 스크립트 ([scripts/check-content-quality.ts](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/scripts/check-content-quality.ts))**:
  - `pnpm run check:content` 명령어로 상시 무결성 검증 가능

---

### Phase 7: Vercel 배포 설정 & 최종 검증
- **배포 설정 ([vercel.json](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/vercel.json))**:
  - Framework: `nextjs`, buildCommand: `pnpm run build`, installCommand: `pnpm install`
- **Linux CI 환경 호환 ([puppeteer-config.json](file:///c:/Users/yeokssami_29/Desktop/coding_job/react-vue-trans/puppeteer-config.json))**:
  - `--no-sandbox`, `--disable-setuid-sandbox` 옵션 적용으로 Vercel 빌드 서버에서 Mermaid Chromium 샌드박스 오류 사전 방지

---

## 3. Definition of Done (완료 기준) 최종 점검표

| 완료 기준 항목 | 판정 | 증빙 및 확인 내용 |
|---|---|---|
| **세 축 모두 최소 1개 이상의 개념 페이지 데이터 존재** | **통과** | `react-vue`, `vue2-vue3`, `nuxt-next` 3개 축 모두 실무 수준 개념 완비 |
| **다크모드 전환 시 구조도 색상이 함께 바뀜** | **통과** | CSS 변수 후처리 매핑으로 SVG fill/stroke 실시간 테마 반응 확인 |
| **모든 코드 예제에 버전이 명시됨** | **통과** | 4-6 규칙 준수, `check:content` 스크립트 통과 |
| **두 보고서에서 겹쳤던 개념이 하나로 병합됨** | **통과** | 01보고서의 비유와 02보고서의 심층 메커니즘을 단일 페이지로 융합 |
| **Vercel 배포 준비 완료** | **통과** | `vercel.json` 및 `pnpm run build` 정적 페이지 7개 생성 통과 |

---

## 4. 실행 및 배포 명령어 안내

```bash
# 1. 개발 서버 실행 (다이어그램 자동 빌드 포함)
pnpm run dev

# 2. 콘텐츠 품질 자동 검수
pnpm run check:content

# 3. 코드 스타일 검사 및 포맷터 실행
pnpm run lint
pnpm run format

# 4. 프로덕션 정적 빌드
pnpm run build

# 5. GitHub 원격 저장소 푸시 (Vercel 자동 배포)
git push -u origin main
```
