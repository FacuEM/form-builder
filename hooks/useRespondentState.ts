import { useRef, useState } from 'react'

export type Direction = 'forward' | 'back'

export interface RespondentState {
  currentIndex: number
  direction: Direction
  answers: Record<string, string>
  navigate: (dir: Direction) => void
  setAnswer: (questionId: string, value: string) => void
  submitting: boolean
  setSubmitting: (v: boolean) => void
}

export interface InitialRespondentState {
  index?: number
  answers?: Record<string, string>
}

export function useRespondentState(
  totalQuestions: number,
  initial?: InitialRespondentState,
): RespondentState {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const i = initial?.index ?? 0
    if (i < 0) return 0
    if (totalQuestions > 0 && i > totalQuestions - 1) return totalQuestions - 1
    return i
  })
  const [direction, setDirection] = useState<Direction>('forward')
  const [answers, setAnswers] = useState<Record<string, string>>(() => initial?.answers ?? {})
  const [submitting, setSubmitting] = useState(false)

  // Freeze direction at navigate() call time so exit animation reads correct value
  const directionRef = useRef<Direction>('forward')

  function navigate(dir: Direction) {
    if (dir === 'back' && currentIndex === 0) return
    if (dir === 'forward' && currentIndex >= totalQuestions - 1) return

    directionRef.current = dir
    setDirection(dir)
    setCurrentIndex((i) => (dir === 'forward' ? i + 1 : i - 1))
  }

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  return {
    currentIndex,
    direction: directionRef.current,
    answers,
    navigate,
    setAnswer,
    submitting,
    setSubmitting,
  }
}
