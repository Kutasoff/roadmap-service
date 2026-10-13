"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin";

const STATUSES = [
  "open",
  "under_review",
  "planned",
  "in_progress",
  "done",
  "declined",
];

export async function updatePostStatus(
  postId: string,
  status: string
): Promise<{ error: string | null }> {
  if (!STATUSES.includes(status)) {
    return { error: "Неверный статус" };
  }

  const { org, supabase } = await getAdminContext();

  const { data: post } = await supabase
    .from("posts")
    .select("id, board_id")
    .eq("id", postId)
    .maybeSingle();

  if (!post) return { error: "Идея не найдена" };

  // Проверка: доска этой идеи принадлежит организации пользователя
  const { data: board } = await supabase
    .from("boards")
    .select("id, slug")
    .eq("id", post.board_id)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!board) return { error: "Нет доступа" };

  const { error } = await supabase
    .from("posts")
    .update({ status })
    .eq("id", postId);

  if (error) return { error: "Не удалось сохранить статус" };

  revalidatePath(`/admin/${board.slug}`);
  revalidatePath(`/${org.slug}/${board.slug}`);
  return { error: null };
}
