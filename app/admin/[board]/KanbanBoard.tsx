"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { updatePostStatus } from "../actions";

type Post = {
  id: string;
  title: string;
  votes_count: number;
  status: string;
};

const COLUMNS = [
  { id: "open", label: "Открыто", color: "bg-gray-100" },
  { id: "under_review", label: "На рассмотрении", color: "bg-yellow-100" },
  { id: "planned", label: "Запланировано", color: "bg-blue-100" },
  { id: "in_progress", label: "В работе", color: "bg-purple-100" },
  { id: "done", label: "Готово", color: "bg-green-100" },
  { id: "declined", label: "Отклонено", color: "bg-red-100" },
];

function Card({ post }: { post: Post }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: post.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative cursor-grab touch-none rounded-lg border bg-white p-3 text-sm shadow-sm ${
        isDragging ? "z-50 opacity-80 shadow-lg" : ""
      }`}
    >
      <div className="font-medium">{post.title}</div>
      <div className="mt-1 text-xs text-gray-500">
        Голосов: {post.votes_count}
      </div>
    </div>
  );
}

function Column({
  id,
  label,
  color,
  posts,
}: {
  id: string;
  label: string;
  color: string;
  posts: Post[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-64 shrink-0 rounded-xl p-3 ${color} ${
        isOver ? "ring-2 ring-black/30" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span className="text-xs text-gray-600">{posts.length}</span>
      </div>
      <div className="min-h-[80px] space-y-2">
        {posts.map((post) => (
          <Card key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard({
  initialPosts,
}: {
  initialPosts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const postId = String(active.id);
    const newStatus = String(over.id);
    const current = posts.find((p) => p.id === postId);

    if (!current || current.status === newStatus) return;

    const previous = posts;
    setPosts(
      posts.map((p) => (p.id === postId ? { ...p, status: newStatus } : p))
    );
    setError(null);

    startTransition(async () => {
      const result = await updatePostStatus(postId, newStatus);
      if (result.error) {
        setPosts(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              posts={posts.filter((p) => p.status === col.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
