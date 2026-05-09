'use client'

import type { Question } from '@/types'

interface Props {
  questions: Question[]
  selectedId: string | null
  onSelect: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
  onDelete: (id: string) => void
}

export function QuestionList({ questions, selectedId, onSelect, onMove, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {questions.map((q, i) => (
        <div
          key={q.id}
          role="listitem"
          tabIndex={0}
          className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
            selectedId === q.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
          onClick={() => onSelect(q.id)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSelect(q.id) }}
        >
          <span className="text-xs font-mono w-4 shrink-0 opacity-40">{i + 1}</span>
          <span className="flex-1 text-sm truncate">{q.text || 'Untitled'}</span>
          {q.required && (
            <span
              className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-red-400/70"
              title="Required"
            >
              *
            </span>
          )}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onMove(q.id, 'up') }}
              disabled={i === 0}
              className="p-1 hover:text-white disabled:opacity-20"
              title="Move up"
            >
              ↑
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMove(q.id, 'down') }}
              disabled={i === questions.length - 1}
              className="p-1 hover:text-white disabled:opacity-20"
              title="Move down"
            >
              ↓
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(q.id) }}
              className="p-1 hover:text-red-400"
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
