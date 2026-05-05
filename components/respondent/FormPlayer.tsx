'use client'

import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { Form } from '@/types'
import { useRespondentState } from '@/hooks/useRespondentState'
import { ProgressBar } from './ProgressBar'
import { QuestionSlide } from './QuestionSlide'
import { ThankYouScreen } from './ThankYouScreen'

interface Props {
  form: Form
}

export function FormPlayer({ form }: Props) {
  const questions = form.questions
  const { currentIndex, direction, answers, navigate, setAnswer, submitting } =
    useRespondentState(questions.length)
  const [done, setDone] = useState(false)
  const [responseId, setResponseId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = questions[currentIndex]
  const currentValue = currentQuestion ? (answers[currentQuestion.id] ?? '') : ''

  async function handleSubmit(overrideValue?: string) {
    if (!currentQuestion) return
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

      if (isLast) setDone(true)
      else navigate('forward')
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  if (done) {
    return <ThankYouScreen message={form.thankYouMessage} />
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
