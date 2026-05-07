'use client'

import { useEffect } from 'react'
import type { Question } from '@/types'
import { hasAnyScoredQuestion, totalScore, weightForAnswer } from '@/lib/scoring'

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
  const showScores = hasAnyScoredQuestion(questions)
  const score = showScores ? totalScore(questions, response.answers) : null

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

        {score != null && (
          <div className="px-6 py-4 border-b border-white/10 flex items-baseline justify-between">
            <span className="text-white/40 text-xs uppercase tracking-wider">Total score</span>
            <span className="text-white text-2xl font-mono">{score}</span>
          </div>
        )}

        <div className="px-6 py-6 flex flex-col gap-6">
          {questions.map((q, i) => {
            const value = answerMap[q.id]
            const weight = weightForAnswer(q, value)
            return (
              <div key={q.id}>
                <p className="text-white/40 text-xs mb-1">
                  {i + 1}. {q.text}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm">
                    {value ?? <span className="text-white/20 italic">No answer</span>}
                  </p>
                  {weight != null && (
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                      +{weight}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
