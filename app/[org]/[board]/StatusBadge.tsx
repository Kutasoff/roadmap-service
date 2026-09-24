const STATUS_LABELS: Record<string, string> = {
    open: 'Открыто',
    under_review: 'На рассмотрении',
    planned: 'Запланировано',
    in_progress: 'В работе',
    done: 'Готово',
    declined: 'Отклонено',
  }
  
  const STATUS_COLORS: Record<string, string> = {
    open: 'bg-gray-100 text-gray-700',
    under_review: 'bg-yellow-100 text-yellow-800',
    planned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    done: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
  }
  
  export default function StatusBadge({ status }: { status: string }) {
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[status] ?? STATUS_COLORS.open}`}>
        {STATUS_LABELS[status] ?? status}
      </span>
    )
  }