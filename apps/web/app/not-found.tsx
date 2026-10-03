import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400">
        <span>404</span> Not Found
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--text-primary)]">
        개념 페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
        요청하신 경로에 해당하는 개념이 존재하지 않거나 이전 주소입니다.
        홈 화면에서 전환 축별 전체 개념 목록을 확인해 보세요.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500"
        >
          홈으로 이동
        </Link>
      </div>
    </div>
  );
}
