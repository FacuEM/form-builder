'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { ResponseDetail } from './ResponseDetail'
import { hasAnyScoredQuestion, totalScore } from '@/lib/scoring'
import { deleteResponse, deleteAllResponses } from '@/app/actions/form'
import type { Question } from '@/types'

function formatCellValue(value: string): string {
  if (value.startsWith('__other__: ')) return `Other: ${value.slice('__other__: '.length)}`
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.map((v: string) =>
        v.startsWith('__other__: ') ? `Other: ${v.slice('__other__: '.length)}` : v
      ).join('; ')
    }
  } catch {}
  return value
}

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
  const [localResponses, setLocalResponses] = useState(responses)
  const [isPending, startTransition] = useTransition()

  const showScores = useMemo(() => hasAnyScoredQuestion(questions), [questions])

  const scored = useMemo(
    () => localResponses.map((r) => ({ r, score: totalScore(questions, r.answers) })),
    [questions, localResponses],
  )

  const sorted = useMemo(() => {
    if (sortMode === 'score' && showScores) {
      return scored.toSorted((a, b) => b.score - a.score)
    }
    return scored.toSorted(
      (a, b) => new Date(b.r.createdAt).getTime() - new Date(a.r.createdAt).getTime(),
    )
  }, [scored, sortMode, showScores])

  function handleDeleteResponse(responseId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Delete this response?')) return
    startTransition(async () => {
      await deleteResponse(responseId, form.id)
      setLocalResponses((prev) => prev.filter((r) => r.id !== responseId))
      if (selected?.id === responseId) setSelected(null)
    })
  }

  function handleDeleteAll() {
    if (!confirm(`Delete all ${localResponses.length} response${localResponses.length !== 1 ? 's' : ''}? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteAllResponses(form.id)
      setLocalResponses([])
      setSelected(null)
    })
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-sm shrink-0">
            ← <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="hidden sm:inline text-white/20">·</span>
          <span className="text-white text-sm truncate">{form.title}</span>
          <span className="hidden sm:inline text-white/20">·</span>
          <span className="hidden sm:inline text-white/40 text-sm shrink-0">Responses</span>
        </div>
        <Link
          href={`/dashboard/forms/${form.id}/edit`}
          className="text-white/40 hover:text-white text-sm transition-colors shrink-0"
        >
          Edit form
        </Link>
      </header>

      <div className="px-6 py-8 max-w-5xl mx-auto">
        {localResponses.length === 0 ? (
          <p className="text-white/30 text-sm">No responses yet.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-xs">
                {localResponses.length} response{localResponses.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAll}
                disabled={isPending}
                className="text-red-400/60 hover:text-red-400 text-xs px-3 py-1.5 border border-red-400/10 rounded-lg hover:border-red-400/30 transition-colors disabled:opacity-40"
              >
                Clear all
              </button>
              <a
                href={`/api/forms/${form.id}/responses/export`}
                className="text-white/50 hover:text-white text-xs px-3 py-1.5 border border-white/10 rounded-lg hover:border-white/30 transition-colors"
              >
                Download CSV
              </a>
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
                    <th className="py-3 w-8" />
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
                        <td className="py-3 pr-6 text-white/60 whitespace-nowrap" suppressHydrationWarning>
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
                              {answerMap[q.id]
                                ? formatCellValue(answerMap[q.id])
                                : <span className="text-white/20">-</span>}
                            </span>
                          </td>
                        ))}
                        <td className="py-3 text-right">
                          <button
                            onClick={(e) => handleDeleteResponse(r.id, e)}
                            disabled={isPending}
                            className="text-white/20 hover:text-red-400 transition-colors text-xs px-1 disabled:opacity-40"
                            aria-label="Delete response"
                          >
                            ✕
                          </button>
                        </td>
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
        onDelete={(id) => {
          if (!confirm('Delete this response?')) return
          startTransition(async () => {
            await deleteResponse(id, form.id)
            setLocalResponses((prev) => prev.filter((r) => r.id !== id))
            setSelected(null)
          })
        }}
      />
    </div>
  )
}
