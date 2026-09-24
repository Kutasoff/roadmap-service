'use client'

import { useState, useRef } from 'react'
import { createPost } from './actions'

export default function AddIdeaForm({
  boardId,
  orgSlug,
  boardSlug,
}: {
  boardId: string
  orgSlug: string
  boardSlug: string
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-black text-white text-sm px-4 py-2 rounded-lg">
        + Добавить идею
      </button>
    )
  }

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await createPost(formData)
        formRef.current?.reset()
        setOpen(false)
      }}
      className="border rounded-lg p-4 space-y-3"
    >
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="orgSlug" value={orgSlug} />
      <input type="hidden" name="boardSlug" value={boardSlug} />
      <input name="title" placeholder="Название идеи" required className="w-full border rounded-md px-3 py-2 text-sm" />
      <textarea name="description" placeholder="Описание (необязательно)" className="w-full border rounded-md px-3 py-2 text-sm" rows={3} />
      <div className="flex gap-2">
        <button type="submit" className="bg-black text-white text-sm px-4 py-2 rounded-lg">Отправить</button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm px-4 py-2 rounded-lg border">Отмена</button>
      </div>
    </form>
  )
}