'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ResponseDetail } from './ResponseDetail'
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

export function ResponsesShell({ form, questions, responses }: Props) {
  const [selected, setSelected] = useState<Response | null>(null)

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
            <p className="text-white/40 text-xs mb-4">
              {responses.length} response{responses.length !== 1 ? 's' : ''}
            </p>
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
                  {responses.map((r) => {
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
