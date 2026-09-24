'use server'

import { createServerClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const boardId = formData.get('boardId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const orgSlug = formData.get('orgSlug') as string
  const boardSlug = formData.get('boardSlug') as string

  if (!title || !boardId) return

  const supabase = createServerClient()

  await supabase.from('posts').insert({
    board_id: boardId,
    title,
    description,
    status: 'open',
  })

  revalidatePath(`/${orgSlug}/${boardSlug}`)
}

export async function castVote(
  postId: string,
  voterId: string,
  orgSlug: string,
  boardSlug: string
): Promise<{ error: string | null; alreadyVoted?: boolean }> {
  if (!voterId) {
    return { error: 'Не удалось определить голосующего' };
  }

  const supabase = createServerClient();

  // Проверка: уже голосовал?
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('post_id', postId)
    .eq('voter_uuid', voterId)
    .maybeSingle();

  if (existingVote) {
    return { error: null, alreadyVoted: true };
  }

  // Простой rate limit: не больше 20 голосов за последний час с этого voter_uuid
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from('votes')
    .select('id', { count: 'exact', head: true })
    .eq('voter_uuid', voterId)
    .gte('created_at', oneHourAgo);

  if ((count ?? 0) >= 20) {
    return { error: 'Слишком много голосов за последний час' };
  }

  const { error: voteError } = await supabase.from('votes').insert({
    post_id: postId,
    voter_uuid: voterId,
  });

  if (voteError) {
    return { error: 'Не удалось сохранить голос' };
  }

  const { data: post } = await supabase
    .from('posts')
    .select('votes_count')
    .eq('id', postId)
    .single();

  if (post) {
    await supabase
      .from('posts')
      .update({ votes_count: post.votes_count + 1 })
      .eq('id', postId);
  }

  revalidatePath(`/${orgSlug}/${boardSlug}`);
  return { error: null };
}

export async function checkVoted(postId: string, voterId: string): Promise<boolean> {
  if (!voterId) return false;

  const supabase = createServerClient();
  const { data } = await supabase
    .from('votes')
    .select('id')
    .eq('post_id', postId)
    .eq('voter_uuid', voterId)
    .maybeSingle();

  return !!data;
}