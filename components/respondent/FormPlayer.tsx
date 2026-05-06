'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { Form } from '@/types'
import { useRespondentState } from '@/hooks/useRespondentState'
import { ProgressBar } from './ProgressBar'
import { QuestionSlide } from './QuestionSlide'
import { ThankYouScreen } from './ThankYouScreen'

interface Props {
  form: Form
}

type Stage = 'welcome' | 'questions' | 'done'

export function FormPlayer({ form }: Props) {
  const questions = form.questions
  const initialStage: Stage = form.welcomeEnabled ? 'welcome' : 'questions'
  const [stage, setStage] = useState<Stage>(initialStage)
  const { currentIndex, direction, answers, navigate, setAnswer, submitting } =
    useRespondentState(questions.length)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]
  const currentValue = currentQuestion ? (answers[currentQuestion.id] ?? '') : ''

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
