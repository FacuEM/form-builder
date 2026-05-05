'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Question } from '@/types'

interface Props {
  question: Question
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  disabled?: boolean
}

export function TextQuestion({ question, value, onChange, onSubmit, disabled }: Props) {
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (question.type === 'LONG_TEXT') {
      textareaRef.current?.focus()
    } else {
      inputRef.current?.focus()
    }
  }, [question.id, question.type])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (question.required && !value.trim()) {
        setShake(true)
        return
      }
      onSubmit()
    }
  }

  const sharedClasses =
    'w-full bg-transparent border-b border-white/20 text-white text-xl placeholder:text-white/30 outline-none pb-2 focus:border-white/60 transition-colors duration-150'

  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => setShake(false)}
    >
      {question.type === 'LONG_TEXT' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer..."
          rows={4}
          className={`${sharedClasses} resize-none`}
        />
      ) : (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer..."
          className={sharedClasses}
        />
      )}
    </motion.div>
  )
}
