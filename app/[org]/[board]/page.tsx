import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import AddIdeaForm from './AddIdeaForm'
import VoteButton from './VoteButton'
import StatusBadge from './StatusBadge'

export default async function BoardPage({ params }: { params: { org: string; board: string } }) {
  const supabase = createServerClient()

  const { data: org } = await supabase.from('organizations').select('id, name, slug').eq('slug', params.org).single()
  if (!org) notFound()

  const { data: board } = await supabase.from('boards').select('id, name, slug').eq('org_id', org.id).eq('slug', params.board).single()
  if (!board) notFound()

  const { data: posts } = await supabase.from('posts').select('*').eq('board_id', board.id).order('votes_count', { ascending: false })

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">{board.name}</h1>

      <AddIdeaForm boardId={board.id} orgSlug={params.org} boardSlug={params.board} />

      <ul className="mt-8 space-y-3">
        {posts?.length === 0 && <p className="text-gray-500 text-sm">Пока нет идей. Будьте первым.</p>}
        {posts?.map((post) => (
          <li key={post.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{post.title}</h3>
                <StatusBadge status={post.status} />
              </div>
              {post.description && (
                <p className="text-sm text-gray-600">
                  {post.description.slice(0, 100)}{post.description.length > 100 ? '…' : ''}
                </p>
              )}
            </div>
            <VoteButton postId={post.id} votesCount={post.votes_count} />
          </li>
        ))}
      </ul>
    </main>
  )
}