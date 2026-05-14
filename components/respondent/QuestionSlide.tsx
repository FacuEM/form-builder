'use client'

import { m } from 'framer-motion'
import { useRef } from 'react'
import type { Direction } from '@/hooks/useRespondentState'
import type { Question } from '@/types'
import { TextQuestion, type TextQuestionHandle } from './questions/TextQuestion'
import { ChoiceQuestion } from './questions/ChoiceQuestion'
import { DropdownQuestion } from './questions/DropdownQuestion'
import { MultiSelectQuestion } from './questions/MultiSelectQuestion'
import { MediaQuestion } from './questions/MediaQuestion'
import { NavigationHint } from './NavigationHint'

const variants = {
  enter: (dir: Direction) => ({ x: dir === 'forward' ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: Direction) => ({ x: dir === 'forward' ? -60 : 60, opacity: 0 }),
}

const transition = { ease: [0.25, 0.1, 0.25, 1] as const, duration: 0.22 }

interface Props {
  question: Question
  index: number
  total: number
  direction: Direction
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  submitting: boolean
  formId: string
  responseId: string | null
  onBack?: () => void
  showBack?: boolean
}

export function QuestionSlide({
  question,
  index,
  total,
  direction,
  value,
  onChange,
  onSubmit,
  submitting,
  formId,
  responseId,
  onBack,
  showBack,
}: Props) {
  const textRef = useRef<TextQuestionHandle>(null)
  const isTextType = question.type === 'TEXT' || question.type === 'LONG_TEXT'
  const handleContinue = isTextType ? () => textRef.current?.submit() : onSubmit

  return (
    <m.div
      key={question.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="w-full max-w-xl px-6"
    >
      <p className="text-white/40 text-sm mb-6 font-mono">
        {index + 1} / {total}
      </p>
      <h2 className="text-white text-2xl font-light mb-3 leading-snug">{question.text}</h2>
      {question.description && (
        <p className="text-white/40 text-sm mb-8 leading-relaxed">{question.description}</p>
      )}

      {question.type === 'STATEMENT' && (
        <NavigationHint onContinue={onSubmit} disabled={submitting} onBack={onBack} showBack={showBack} />
      )}
      {(question.type === 'TEXT' || question.type === 'LONG_TEXT') && (
        <TextQuestion ref={textRef} question={question} value={value} onChange={onChange} onSubmit={onSubmit} disabled={submitting} />
      )}
      {question.type === 'CHOICE' && (
        <ChoiceQuestion question={question} value={value} onChange={onChange} onSubmit={onSubmit} disabled={submitting} />
      )}
      {question.type === 'DROPDOWN' && (
        <DropdownQuestion question={question} value={value} onChange={onChange} onSubmit={onSubmit} disabled={submitting} />
      )}
      {question.type === 'MULTI_SELECT' && (
        <MultiSelectQuestion question={question} value={value} onChange={onChange} onSubmit={onSubmit} disabled={submitting} />
      )}
      {question.type === 'MEDIA' && (
        <MediaQuestion
          question={question}
          value={value}
          onChange={onChange}
          formId={formId}
          responseId={responseId ?? formId}
          disabled={submitting}
        />
      )}
      {question.type !== 'STATEMENT' && (
        <NavigationHint
          onContinue={handleContinue}
          disabled={submitting}
          hasAnswer={value.trim().length > 0}
          onBack={onBack}
          showBack={showBack}
        />
      )}
    </m.div>
  )
}
