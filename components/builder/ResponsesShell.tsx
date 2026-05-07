'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ResponseDetail } from './ResponseDetail'
import { hasAnyScoredQuestion, totalScore } from '@/lib/scoring'
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

interface Form {
  id: string
  title: string
}

interface Props {
  form: Form
  questions: Question[]
  responses: Response[]
}

type SortMode = 'date' | 'score'

export function ResponsesShell({ form, questions, responses }: Props) {
  const [selected, setSelected] = useState<Response | null>(null)
  const [sortMode, setSortMode] = useState<SortMode>('date')

  const showScores = useMemo(() => hasAnyScoredQuestion(questions), [questions])

  const scored = useMemo(
    () => responses.map((r) => ({ r, score: totalScore(questions, r.answers) })),
    [questions, responses],
  )

  const sorted = useMemo(() => {
    if (sortMode === 'score' && showScores) {
      return [...scored].sort((a, b) => b.score - a.score)
    }
    return [...scored].sort(
      (a, b) => new Date(b.r.createdAt).getTime() - new Date(a.r.createdAt).getTime(),
    )
  }, [scored, sortMode, showScores])

  return (
    <div className="min-h-screen bg-[#080808]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-sm">
            ← Dashboard
          </Link>
          <span className="text-white/20">·</span>
          <span className="text-white text-sm">{form.title}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40 text-sm">Responses</span>
        </div>
        <Link
          href={`/dashboard/forms/${form.id}/edit`}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          Edit form
        </Link>
      </header>

      <div className="px-6 py-8 max-w-5xl mx-auto">
        {responses.length === 0 ? (
          <p className="text-white/30 text-sm">No responses yet.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-xs">
                {responses.length} response{responses.length !== 1 ? 's' : ''}
              </p>
              {showScores && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">Sort by</span>
                  {(['date', 'score'] as SortMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSortMode(m)}
                      className={`px-2 py-1 rounded transition-colors capitalize ${
                        sortMode === m
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/40 font-normal py-3 pr-6 whitespace-nowrap">
                      Submitted
                    </th>
                    <th className="text-left text-white/40 font-normal py-3 pr-6 whitespace-nowrap">
                      Status
                    </th>
                    {showScores && (
                      <th className="text-left text-white/40 font-normal py-3 pr-6 whitespace-nowrap">
                        Score
                      </th>
                    )}
                    {questions.map((q) => (
                      <th
                        key={q.id}
                        className="text-left text-white/40 font-normal py-3 pr-6 max-w-[180px]"
                      >
                        <span className="truncate block">{q.text}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(({ r, score }) => {
                    const answerMap = Object.fromEntries(r.answers.map((a) => [a.questionId, a.value]))
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r)}
                        className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
                      >
                        <td className="py-3 pr-6 text-white/60 whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 pr-6 whitespace-nowrap">
                          {r.completed ? (
                            <span className="text-green-400/70">Complete</span>
                          ) : (
                            <span className="text-yellow-400/60">Partial</span>
                          )}
                        </td>
                        {showScores && (
                          <td className="py-3 pr-6 whitespace-nowrap text-white font-mono">
                            {score}
                          </td>
                        )}
                        {questions.map((q) => (
                          <td key={q.id} className="py-3 pr-6 text-white/80 max-w-[180px]">
                            <span className="truncate block">
                              {answerMap[q.id] ?? <span className="text-white/20">—</span>}
                            </span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#080808] to-transparent md:hidden"
              />
            </div>
          </>
        )}
      </div>

      <ResponseDetail
        response={selected}
        questions={questions}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
