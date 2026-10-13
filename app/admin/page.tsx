import Link from "next/link";
import { getAdminContext } from "@/lib/admin";
import { signOut } from "@/app/actions/auth";

export default async function AdminPage() {
  const { org, supabase } = await getAdminContext();

  const { data: boards } = await supabase
    .from("boards")
    .select("id, name, slug")
    .eq("org_id", org.id)
    .order("created_at");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{org.name}</h1>
        <form action={signOut}>
          <button className="rounded-lg border px-3 py-1.5 text-sm">
            Выйти
          </button>
        </form>
      </div>

      <h2 className="mb-3 text-sm font-medium text-gray-500">Ваши доски</h2>
      <ul className="space-y-3">
        {boards?.map((board) => (
          <li
            key={board.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <span className="font-medium">{board.name}</span>
            <div className="flex gap-2 text-sm">
              <Link
                href={`/admin/${board.slug}`}
                className="rounded-lg bg-black px-3 py-1.5 text-white"
              >
                Управлять
              </Link>
              <Link
                href={`/${org.slug}/${board.slug}`}
                className="rounded-lg border px-3 py-1.5"
                target="_blank"
              >
                Публичная страница
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
