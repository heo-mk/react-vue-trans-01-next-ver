This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 다이어그램 빌드 파이프라인 (Diagram Build Pipeline)

- **Mermaid CLI (mmdc)**: `content/diagrams/*.mmd` 소스를 빌드 시점에 정적 인라인 SVG로 사전 렌더링합니다 (`Zero-Runtime SVG`).
- **CSS 변수 실시간 매핑**: 빌드 스크립트(`scripts/build-diagrams.ts`)에서 고정 Hex 색상 및 기본 Mermaid 스타일을 디자인 토큰 CSS 변수(`var(--diagram-*)`)로 치환하여 상단 테마 버튼 토글 시 다크/라이트 모드 색상이 실시간으로 전환됩니다.
- **반응형 듀얼 빌드**: 화면 폭 640px 이상(데스크톱)용 가로 버전과 640px 미만(모바일 375px 대응)용 세로 버전(`*-vertical.mmd`)을 각각 생성하여 CSS 미디어 쿼리로 최적의 폰트 가독성을 보장합니다.
- **다이어그램 빌드 명령**:
  ```bash
  pnpm run build:diagrams
  ```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
