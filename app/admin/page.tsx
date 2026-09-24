import { signOut } from "@/app/actions/auth";
import { requireAuthUser } from "@/lib/session";
import { createSupabaseAdmin } from "@/lib/supabase";

export default async function AdminPage() {
  const authUser = await requireAuthUser();
  const supabase = createSupabaseAdmin();

  const { data: profile } = await supabase
    .from("users")
    .select("role, email, organizations ( name, slug )")
    .eq("id", authUser.id)
    .maybeSingle();

  type OrganizationInfo = { name: string; slug: string };
  const embedded = profile?.organizations as
    | OrganizationInfo
    | OrganizationInfo[]
    | null
    | undefined;
  const organization = Array.isArray(embedded) ? embedded[0] : embedded;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Админка</h1>
          <p className="mt-1 text-sm text-foreground/70">
            Вы вошли как {profile?.email ?? authUser.email}
          </p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="h-10 rounded-lg border border-black/[.08] px-4 text-sm font-medium hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
          >
            Выйти
          </button>
        </form>
      </div>
      <section className="rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]">
        <p className="text-sm text-foreground/70">Организация</p>
        <p className="mt-1 text-lg font-medium">
          {organization?.name ?? "—"}
        </p>
        {organization?.slug ? (
          <p className="mt-1 text-sm text-foreground/60">/{organization.slug}</p>
        ) : null}
        <p className="mt-4 text-sm text-foreground/70">
          Роль: {profile?.role ?? "—"}
        </p>
      </section>
    </main>
  );
}
