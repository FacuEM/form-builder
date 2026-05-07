'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Form } from '@/types'
import { useRespondentState } from '@/hooks/useRespondentState'
import { clearProgress, loadProgress, saveProgress, type Stage } from '@/lib/formProgress'
import { ProgressBar } from './ProgressBar'
import { QuestionSlide } from './QuestionSlide'
import { ThankYouScreen } from './ThankYouScreen'

interface Props {
  form: Form
}

interface RestoredState {
  index: number
  answers: Record<string, string>
  responseId: string | null
  stage: Stage
}

function readInitial(form: Form): RestoredState {
  const defaultStage: Stage = form.welcomeEnabled ? 'welcome' : 'questions'
  if (typeof window === 'undefined') {
    return { index: 0, answers: {}, responseId: null, stage: defaultStage }
  }
  const saved = loadProgress(form.id)
  if (!saved || saved.stage === 'done') {
    return { index: 0, answers: {}, responseId: null, stage: defaultStage }
  }
  // Drop answers for question IDs that no longer exist (form may have been edited)
  const validIds = new Set(form.questions.map((q) => q.id))
  const filtered: Record<string, string> = {}
  for (const [id, val] of Object.entries(saved.answers)) {
    if (validIds.has(id)) filtered[id] = val
  }
  const maxIndex = Math.max(0, form.questions.length - 1)
  return {
    index: Math.min(saved.index, maxIndex),
    answers: filtered,
    responseId: saved.responseId,
    stage: saved.stage,
  }
}

export function FormPlayer({ form }: Props) {
  const questions = form.questions
  const [restored] = useState<RestoredState>(() => readInitial(form))

  const [stage, setStage] = useState<Stage>(restored.stage)
  const { currentIndex, direction, answers, navigate, setAnswer, submitting } =
    useRespondentState(questions.length, { index: restored.index, answers: restored.answers })
  const [responseId, setResponseId] = useState<string | null>(restored.responseId)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]
  const currentValue = currentQuestion ? (answers[currentQuestion.id] ?? '') : ''

  // Persist progress on every meaningful change
  useEffect(() => {
    if (stage === 'done') return
    saveProgress(form.id, {
      index: currentIndex,
      answers,
      responseId,
      stage,
    })
  }, [form.id, currentIndex, answers, responseId, stage])

  // Clear once we're done
  useEffect(() => {
    if (stage === 'done') clearProgress(form.id)
  }, [stage, form.id])

  async function handleSubmit(overrideValue?: string) {
    if (!currentQuestion) return

    if (currentQuestion.type === 'STATEMENT' || currentQuestion.type === 'WELCOME') {
      const isLast = currentIndex === questions.length - 1
      if (isLast) {
        if (form.thankYouEnabled) setStage('done')
      } else {
        navigate('forward')
      }
      return
    }

    const effectiveValue = overrideValue ?? currentValue
    if (currentQuestion.required && !effectiveValue.trim()) return

    setError(null)
    const isLast = currentIndex === questions.length - 1

    try {
      const token = getOrCreateToken()
      const body: Record<string, unknown> = {
        respondentToken: token,
        answers: [{ questionId: currentQuestion.id, value: effectiveValue }],
      }
      if (responseId) body.responseId = responseId

      const res = await fetch(`/api/forms/${form.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, completed: isLast }),
      })

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()
      if (!responseId) setResponseId(data.responseId)

      if (isLast) {
        if (form.thankYouEnabled) setStage('done')
      } else {
        navigate('forward')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  if (stage === 'done') {
    return (
      <ThankYouScreen
        title={form.thankYouTitle}
        description={form.thankYouMessage || undefined}
      />
    )
  }

  if (stage === 'welcome') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-screen bg-[#080808] flex items-center justify-center px-6"
      >
        <div className="max-w-xl w-full">
          {form.welcomeAlert && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6 flex items-start gap-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3"
            >
              <span aria-hidden className="text-amber-300 text-base leading-none mt-0.5">⚠</span>
              <p className="text-amber-100/90 text-sm leading-relaxed">{form.welcomeAlert}</p>
            </motion.div>
          )}
          <h1 className="text-white text-4xl font-light mb-4 leading-tight">{form.welcomeTitle}</h1>
          {form.welcomeDescription && (
            <p className="text-white/50 text-lg font-light mb-10 leading-relaxed">{form.welcomeDescription}</p>
          )}
          <button
            onClick={() => setStage('questions')}
            className="mt-8 px-8 py-3.5 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Start →
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#080808] flex flex-col items-center justify-center overflow-hidden">
      <ProgressBar current={currentIndex} total={questions.length} />

      <AnimatePresence mode="wait" custom={direction}>
        {currentQuestion && (
          <QuestionSlide
            key={currentQuestion.id}
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            direction={direction}
            value={currentValue}
            onChange={(val) => setAnswer(currentQuestion.id, val)}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </AnimatePresence>

      {error && (
        <p className="fixed bottom-8 left-1/2 -translate-x-1/2 text-red-400 text-sm">{error}</p>
      )}

      {currentIndex > 0 && (
        <button
          onClick={() => navigate('back')}
          className="fixed bottom-8 right-8 text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  )
}

function getOrCreateToken(): string | null {
  try {
    const key = 'respondent_token'
    const existing = localStorage.getItem(key)
    if (existing) return existing
    const token = crypto.randomUUID()
    localStorage.setItem(key, token)
    return token
  } catch {
    return null
  }
}
