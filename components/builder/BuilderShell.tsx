'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuestionList } from './QuestionList'
import { QuestionEditor } from './QuestionEditor'
import { SettingsPanel } from './SettingsPanel'
import {
  createQuestion,
  updateQuestion,
  updateQuestionType,
  deleteQuestion,
  moveQuestion,
  createChoice,
  updateChoice,
  deleteChoice,
} from '@/app/actions/form'
import type { Form, Question, Choice } from '@/types'

interface Props {
  form: Form & { questions: Question[] }
  hasResponses: boolean
}

type Tab = 'questions' | 'settings'

export function BuilderShell({ form, hasResponses }: Props) {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>(form.questions)
  const [selectedId, setSelectedId] = useState<string | null>(form.questions[0]?.id ?? null)
  const [tab, setTab] = useState<Tab>('questions')

  // Sync from server when form prop updates (e.g. after router.refresh())
  useEffect(() => {
    setQuestions(form.questions)
  }, [form.questions])

  const refresh = useCallback(() => router.refresh(), [router])

  // --- Question handlers ---

  async function handleCreateQuestion() {
    const newQ = await createQuestion(form.id)
    const q: Question = { ...newQ, choices: [] }
    setQuestions((prev) => [...prev, q])
    setSelectedId(newQ.id)
    setTab('questions')
    refresh()
  }

  async function handleUpdateQuestion(questionId: string, data: { text?: string; description?: string; required?: boolean }) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...data } : q))
    )
    await updateQuestion(questionId, form.id, data)
    refresh()
  }

  async function handleUpdateQuestionType(questionId: string, type: Question['type'], deleteChoices: boolean) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, type, choices: deleteChoices ? [] : q.choices }
          : q
      )
    )
    await updateQuestionType(questionId, form.id, type, deleteChoices)
    refresh()
  }

  async function handleDeleteQuestion(questionId: string) {
    setQuestions((prev) => {
      const next = prev.filter((q) => q.id !== questionId)
      if (selectedId === questionId) {
        setSelectedId(next[0]?.id ?? null)
      }
      return next
    })
    await deleteQuestion(questionId, form.id)
    refresh()
  }

  async function handleMoveQuestion(questionId: string, dir: 'up' | 'down') {
    setQuestions((prev) => {
      const next = [...prev]
      const idx = next.findIndex((q) => q.id === questionId)
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= next.length) return prev
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
    await moveQuestion(questionId, form.id, dir)
    refresh()
  }

  // --- Choice handlers ---

  async function handleCreateChoice(questionId: string) {
    const tempId = `temp-${Date.now()}`
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: [...q.choices, { id: tempId, questionId, label: 'Option', order: q.choices.length }] }
          : q
      )
    )
    const real = await createChoice(questionId, form.id)
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.map((c) => (c.id === tempId ? (real as Choice) : c)) }
          : q
      )
    )
    refresh()
  }

  async function handleUpdateChoice(choiceId: string, questionId: string, label: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.map((c) => (c.id === choiceId ? { ...c, label } : c)) }
          : q
      )
    )
    await updateChoice(choiceId, form.id, label)
    refresh()
  }

  async function handleDeleteChoice(choiceId: string, questionId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.filter((c) => c.id !== choiceId) }
          : q
      )
    )
    await deleteChoice(choiceId, form.id)
    refresh()
  }

  const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null

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
                  questions={questions}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onMove={handleMoveQuestion}
                  onDelete={handleDeleteQuestion}
                />
                <button
                  onClick={handleCreateQuestion}
                  className="w-full mt-3 py-2 text-white/40 hover:text-white text-sm border border-dashed border-white/10 hover:border-white/30 rounded-lg transition-colors"
                >
                  + Add question
                </button>
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
              <QuestionEditor
                question={selectedQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onUpdateQuestionType={handleUpdateQuestionType}
                onCreateChoice={handleCreateChoice}
                onUpdateChoice={handleUpdateChoice}
                onDeleteChoice={handleDeleteChoice}
              />
            </div>
          ) : tab === 'questions' && questions.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-white/30 text-sm">Add a question to get started.</p>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
