'use client'

import { moveQuestion, deleteQuestion } from '@/app/actions/form'
import type { Question } from '@/types'

interface Props {
  questions: Question[]
  formId: string
  selectedId: string | null
  onSelect: (id: string) => void
}

export function QuestionList({ questions, formId, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-1">
      {questions.map((q, i) => (
        <div
          key={q.id}
          className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
            selectedId === q.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'
          }`}
          onClick={() => onSelect(q.id)}
        >
          <span className="text-xs font-mono w-4 shrink-0 opacity-40">{i + 1}</span>
          <span className="flex-1 text-sm truncate">{q.text || 'Untitled question'}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <form action={moveQuestion.bind(null, q.id, formId, 'up')}>
              <button
                type="submit"
                disabled={i === 0}
                className="p-1 hover:text-white disabled:opacity-20"
                title="Move up"
              >
                ↑
              </button>
            </form>
            <form action={moveQuestion.bind(null, q.id, formId, 'down')}>
              <button
                type="submit"
                disabled={i === questions.length - 1}
                className="p-1 hover:text-white disabled:opacity-20"
                title="Move down"
              >
                ↓
              </button>
            </form>
            <form action={deleteQuestion.bind(null, q.id, formId)}>
              <button type="submit" className="p-1 hover:text-red-400" title="Delete">
                ✕
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
