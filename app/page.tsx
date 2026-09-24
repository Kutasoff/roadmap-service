import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold tracking-tight">Feature Requests</h1>
      <p className="max-w-md text-center text-foreground/70">
        Зарегистрируйте компанию, чтобы открыть первую доску обратной связи.
      </p>
      <div className="flex gap-3">
        <Link
          href="/signup"
          className="flex h-11 items-center rounded-lg bg-foreground px-5 text-sm font-medium text-background"
        >
          Регистрация
        </Link>
        <Link
          href="/login"
          className="flex h-11 items-center rounded-lg border border-black/[.08] px-5 text-sm font-medium dark:border-white/[.145]"
        >
          Вход
        </Link>
      </div>
    </main>
  );
}
