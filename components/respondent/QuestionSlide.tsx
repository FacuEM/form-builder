'use client'

import { motion } from 'framer-motion'
import type { Direction } from '@/hooks/useRespondentState'
import type { Question } from '@/types'
import { TextQuestion } from './questions/TextQuestion'
import { ChoiceQuestion } from './questions/ChoiceQuestion'
import { DropdownQuestion } from './questions/DropdownQuestion'
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
}: Props) {
  return (
    <motion.div
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
      <h2 className="text-white text-2xl font-light mb-8 leading-snug">{question.text}</h2>

      {question.type === 'STATEMENT' && (
        <NavigationHint onContinue={onSubmit} disabled={submitting} />
      )}
      {(question.type === 'TEXT' || question.type === 'LONG_TEXT') && (
        <TextQuestion question={question} value={value} onChange={onChange} onSubmit={onSubmit} disabled={submitting} />
      )}
      {question.type === 'CHOICE' && (
        <ChoiceQuestion question={question} value={value} onChange={onChange} onSubmit={onSubmit} disabled={submitting} />
      )}
      {question.type === 'DROPDOWN' && (
        <DropdownQuestion question={question} value={value} onChange={onChange} onSubmit={onSubmit} disabled={submitting} />
      )}
      {question.type !== 'STATEMENT' && (
        <NavigationHint onContinue={onSubmit} disabled={submitting} />
      )}
    </motion.div>
  )
}
