'use client'

import { useParams } from 'next/navigation'
import { castVote, checkVoted } from './actions'
import { useState, useEffect, useTransition } from 'react'
import { getVoterId } from '@/lib/voter'

export default function VoteButton({ postId, votesCount }: { postId: string; votesCount: number }) {
  const params = useParams<{ org: string; board: string }>()
  const [count, setCount] = useState(votesCount)
  const [voted, setVoted] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const voterId = getVoterId();
    checkVoted(postId, voterId).then(setVoted);
  }, [postId]);

  function handleVote() {
    const voterId = getVoterId();
    startTransition(async () => {
      const result = await castVote(postId, voterId, params.org, params.board);
      if (!result.error) {
        setVoted(true);
        setCount((c) => c + 1);
      }
    });
  }

  if (voted === null) {
    return (
      <div className="flex flex-col items-center border rounded-lg px-3 py-2 opacity-50">
        <span className="text-sm font-semibold">{count}</span>
        <span className="text-xs text-gray-500">…</span>
      </div>
    );
  }

  return (
    <button
      disabled={isPending || voted}
      onClick={handleVote}
      className={`flex flex-col items-center border rounded-lg px-3 py-2 ${
        voted ? 'bg-gray-50' : 'hover:bg-gray-50'
      } disabled:opacity-70`}
    >
      <span className="text-sm font-semibold">{count}</span>
      <span className="text-xs text-gray-500">{voted ? 'вы голосовали' : 'голос'}</span>
    </button>
  )
}