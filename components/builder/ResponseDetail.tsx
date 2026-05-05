'use client'

import { useEffect } from 'react'
import type { Question } from '@/types'

interface Answer {
  id: string
  questionId: string
  value: string
}

interface Response {
  id: string
  createdAt: string
  completed: boolean
  answers: Answer[]
}

interface Props {
  response: Response | null
  questions: Question[]
  onClose: () => void
}

export function ResponseDetail({ response, questions, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!response) return null

  const answerMap = Object.fromEntries(response.answers.map((a) => [a.questionId, a.value]))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0d0d0d] border-l border-white/10 z-50 overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <p className="text-white text-sm font-medium">Response</p>
            <p className="text-white/40 text-xs mt-0.5">
              {new Date(response.createdAt).toLocaleString()} ·{' '}
              {response.completed ? (
                <span className="text-green-400/70">Complete</span>
              ) : (
                <span className="text-yellow-400/60">Partial</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-6">
          {questions.map((q, i) => (
            <div key={q.id}>
              <p className="text-white/40 text-xs mb-1">
                {i + 1}. {q.text}
              </p>
              <p className="text-white text-sm">
                {answerMap[q.id] ?? <span className="text-white/20 italic">No answer</span>}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
