'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { QuestionList } from './QuestionList'
import { QuestionEditor } from './QuestionEditor'
import { SettingsPanel } from './SettingsPanel'
import type { Form, Question } from '@/types'

interface Props {
  form: Form & { questions: Question[] }
  hasResponses: boolean
  createQuestion: () => Promise<void>
}

type Tab = 'questions' | 'settings'

export function BuilderShell({ form, hasResponses, createQuestion }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(form.questions[0]?.id ?? null)
  const [tab, setTab] = useState<Tab>('questions')

  // Auto-select newly created questions
  const seenIds = useRef(new Set(form.questions.map((q) => q.id)))
  useEffect(() => {
    const newQ = form.questions.find((q) => !seenIds.current.has(q.id))
    if (newQ) {
      setSelectedId(newQ.id)
      setTab('questions')
    }
    seenIds.current = new Set(form.questions.map((q) => q.id))
  }, [form.questions])

  const selectedQuestion = form.questions.find((q) => q.id === selectedId) ?? null

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-sm">
            ← Dashboard
          </Link>
          <span className="text-white/20">·</span>
          <span className="text-white text-sm truncate max-w-xs">{form.title}</span>
        </div>
        <div className="flex items-center gap-3">
          {form.published && (
            <a
              href={`/forms/${form.id}`}
              target="_blank"
              rel="noreferrer"
              className="text-white/50 hover:text-white text-sm transition-colors"
            >
              Preview ↗
            </a>
          )}
          <Link
            href={`/dashboard/forms/${form.id}/responses`}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            Responses
          </Link>
        </div>
      </header>

      {hasResponses && (
        <div className="px-6 py-3 bg-yellow-500/10 border-b border-yellow-500/20">
          <p className="text-yellow-400/80 text-sm">
            This form has responses. Editing or deleting questions may affect how existing responses display.
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-64 border-r border-white/10 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(['questions', 'settings'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm capitalize transition-colors ${
                  tab === t ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {tab === 'questions' ? (
              <>
                <QuestionList
                  questions={form.questions}
                  formId={form.id}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
                <form action={createQuestion} className="mt-3">
                  <button
                    type="submit"
                    className="w-full py-2 text-white/40 hover:text-white text-sm border border-dashed border-white/10 hover:border-white/30 rounded-lg transition-colors"
                  >
                    + Add question
                  </button>
                </form>
              </>
            ) : (
              <SettingsPanel form={form} />
            )}
          </div>
        </aside>

        {/* Main editor area */}
        <main className="flex-1 overflow-y-auto">
          {tab === 'questions' && selectedQuestion ? (
            <div className="p-8 max-w-xl">
              <QuestionEditor question={selectedQuestion} formId={form.id} />
            </div>
          ) : tab === 'questions' && form.questions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/30 text-sm">Add a question to get started.</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
