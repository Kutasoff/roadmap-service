import Link from "next/link";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-black/[.08] bg-background p-8 shadow-sm dark:border-white/[.145]">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 mb-6 text-sm text-foreground/70">{description}</p>
        {children}
        <p className="mt-6 text-center text-sm text-foreground/70">{footer}</p>
      </div>
    </main>
  );
}

export function AuthLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-foreground underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}
