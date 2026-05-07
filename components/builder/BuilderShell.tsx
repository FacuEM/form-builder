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
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setQuestions(form.questions)
  }, [form.questions])

  const refresh = useCallback(() => router.refresh(), [router])

  async function handleCreateQuestion() {
    const newQ = await createQuestion(form.id)
    const q: Question = { ...newQ, choices: [] }
    setQuestions((prev) => [...prev, q])
    setSelectedId(newQ.id)
    setTab('questions')
    setMobileView('editor')
    refresh()
  }

  async function handleUpdateQuestion(questionId: string, data: { text?: string; description?: string; required?: boolean; scored?: boolean }) {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...data } : q)))
    await updateQuestion(questionId, form.id, data)
    refresh()
  }

  async function handleUpdateQuestionType(questionId: string, type: Question['type'], deleteChoices: boolean) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, type, choices: deleteChoices ? [] : q.choices } : q
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

  async function handleCreateChoice(questionId: string) {
    const tempId = `temp-${Date.now()}`
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: [...q.choices, { id: tempId, questionId, label: 'Option', order: q.choices.length, weight: 0 }] }
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

  async function handleUpdateChoice(choiceId: string, questionId: string, data: { label?: string; weight?: number }) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, choices: q.choices.map((c) => (c.id === choiceId ? { ...c, ...data } : c)) }
          : q
      )
    )
    await updateChoice(choiceId, form.id, data)
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

  async function copyShareLink() {
    const url = `${window.location.origin}/forms/${form.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function selectQuestion(id: string) {
    setSelectedId(id)
    setMobileView('editor')
  }

  const selectedQuestion = questions.find((q) => q.id === selectedId) ?? null

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors text-sm shrink-0">
            ← <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <span className="hidden sm:inline text-white/20">·</span>
          <span className="text-white text-sm truncate">{form.title}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {form.published && (
            <>
              <button
                onClick={copyShareLink}
                className="text-white/50 hover:text-white text-xs sm:text-sm transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy link'}
              </button>
              <a
                href={`/forms/${form.id}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline text-white/50 hover:text-white text-sm transition-colors"
              >
                Preview ↗
              </a>
            </>
          )}
          <Link
            href={`/dashboard/forms/${form.id}/responses`}
            className="text-white/50 hover:text-white text-xs sm:text-sm transition-colors"
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

      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        {/* Left sidebar / mobile list view */}
        <aside
          className={`md:w-64 md:border-r border-white/10 flex-col ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="flex border-b border-white/10">
            {(['questions', 'settings'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t)
                  setMobileView(t === 'settings' ? 'editor' : 'list')
                }}
                className={`flex-1 py-3 text-sm capitalize transition-colors ${
                  tab === t ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'questions' && (
            <div className="flex-1 md:overflow-y-auto p-3">
              <QuestionList
                questions={questions}
                selectedId={selectedId}
                onSelect={selectQuestion}
                onMove={handleMoveQuestion}
                onDelete={handleDeleteQuestion}
              />
              <button
                onClick={handleCreateQuestion}
                className="w-full mt-3 py-2 text-white/40 hover:text-white text-sm border border-dashed border-white/10 hover:border-white/30 rounded-lg transition-colors"
              >
                + Add question
              </button>
            </div>
          )}
        </aside>

        {/* Main editor area */}
        <main
          className={`flex-1 md:overflow-y-auto ${
            mobileView === 'editor' || tab === 'settings' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Mobile back button */}
          {tab === 'questions' && selectedQuestion && (
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden flex items-center gap-2 px-4 py-3 text-white/50 hover:text-white text-sm border-b border-white/10 w-full"
            >
              ← Back to questions
            </button>
          )}

          {tab === 'settings' ? (
            <div className="mx-auto max-w-2xl px-6 sm:px-8 py-8 sm:py-12">
              <SettingsPanel form={form} />
            </div>
          ) : selectedQuestion ? (
            <div className="mx-auto max-w-2xl px-6 sm:px-8 py-8 sm:py-12">
              <QuestionEditor
                question={selectedQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onUpdateQuestionType={handleUpdateQuestionType}
                onCreateChoice={handleCreateChoice}
                onUpdateChoice={handleUpdateChoice}
                onDeleteChoice={handleDeleteChoice}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[40vh] md:h-full px-6 py-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-white/40 text-sm">Your form is empty.</p>
                <button
                  onClick={handleCreateQuestion}
                  className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
                >
                  + Add your first question
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
