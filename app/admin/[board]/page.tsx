import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminContext } from "@/lib/admin";
import KanbanBoard from "./KanbanBoard";

export default async function AdminBoardPage({
  params,
}: {
  params: { board: string };
}) {
  const { org, supabase } = await getAdminContext();

  const { data: board } = await supabase
    .from("boards")
    .select("id, name, slug")
    .eq("org_id", org.id)
    .eq("slug", params.board)
    .maybeSingle();

  if (!board) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, votes_count, status")
    .eq("board_id", board.id)
    .order("votes_count", { ascending: false });

  return (
    <main className="px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin" className="text-sm text-gray-500">
            ← Все доски
          </Link>
          <h1 className="text-2xl font-semibold">{board.name}</h1>
        </div>
        <Link
          href={`/${org.slug}/${board.slug}`}
          target="_blank"
          className="rounded-lg border px-3 py-1.5 text-sm"
        >
          Публичная страница
        </Link>
      </div>

      <KanbanBoard initialPosts={posts ?? []} />
    </main>
  );
}
