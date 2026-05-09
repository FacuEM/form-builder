'use client'

import { m } from 'framer-motion'
import { useEffect, useSyncExternalStore, useState } from 'react'
import type { Question } from '@/types'
import { detectTouchDevice } from '@/lib/touchDetect'

const subscribe = () => () => {}
const useTouchDevice = () =>
  useSyncExternalStore(subscribe, detectTouchDevice, () => false)

interface Props {
  question: Question
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  disabled?: boolean
}

const KEY_MAP: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 }

export function ChoiceQuestion({ question, value, onChange, onSubmit, disabled }: Props) {
  const [shake, setShake] = useState(false)
  const isTouchDevice = useTouchDevice()

  useEffect(() => {
    if (isTouchDevice) return
    function onKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase()
      if (key in KEY_MAP) {
        const choice = question.choices[KEY_MAP[key]]
        if (choice) onChange(choice.label)
      }
      if (e.key === 'Enter') {
        if (question.required && !value) {
          setShake(true)
          return
        }
        onSubmit()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isTouchDevice, question.choices, question.required, value, onChange, onSubmit])

  return (
    <m.div
      suppressHydrationWarning
      className="flex flex-col gap-3"
      animate={shake ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => setShake(false)}
    >
      {question.choices.map((choice, i) => {
        const letter = ['A', 'B', 'C', 'D'][i] ?? String(i + 1)
        const selected = value === choice.label

        return (
          <button
            key={choice.id}
            disabled={disabled}
            onClick={() => {
              onChange(choice.label)
            }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-150 ${
              selected
                ? 'border-white bg-white/10 text-white'
                : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white'
            }`}
          >
            <span className="text-xs font-mono opacity-60 w-5 shrink-0">{letter}</span>
            <span>{choice.label}</span>
          </button>
        )
      })}
    </m.div>
  )
}
