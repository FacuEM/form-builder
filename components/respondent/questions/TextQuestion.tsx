'use client'

import { m } from 'framer-motion'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Question } from '@/types'
import { PhoneQuestion } from './PhoneQuestion'
import { CountryQuestion } from './CountryQuestion'

export interface TextQuestionHandle {
  submit: () => void
}

interface Props {
  question: Question
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  disabled?: boolean
}

// Validation helpers
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

function validatePhone(v: string) {
  // Stored as "+dialcode localnumber" — require 7–15 total digits (ITU E.164)
  const digits = v.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

function validateUrl(v: string) {
  try {
    const url = new URL(v.trim().startsWith('http') ? v.trim() : `https://${v.trim()}`)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function getValidationError(question: Question, value: string): string | null {
  if (!value.trim()) return null // empty handled by required check
  const sub = question.textInputType
  if (sub === 'email' && !validateEmail(value)) return 'Please enter a valid email address'
  if (sub === 'phone' && !validatePhone(value)) return 'Please enter a valid phone number'
  if (sub === 'url'   && !validateUrl(value))   return 'Please enter a valid URL (e.g. https://example.com)'
  return null
}

// Map our TextInputType to an HTML input type
function htmlInputType(q: Question): string {
  switch (q.textInputType) {
    case 'email': return 'email'
    case 'phone': return 'tel'
    case 'url':   return 'url'
    default:      return 'text'
  }
}

function defaultPlaceholder(q: Question): string {
  switch (q.textInputType) {
    case 'email': return 'name@example.com'
    case 'phone': return '+1 (555) 000-0000'
    case 'url':   return 'https://example.com'
    default:      return 'Type your answer…'
  }
}

export const TextQuestion = forwardRef<TextQuestionHandle, Props>(function TextQuestion(
  { question, value, onChange, onSubmit, disabled }: Props,
  ref,
) {
  const [shake, setShake] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const inputRef    = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useImperativeHandle(ref, () => ({ submit: handleSubmit }))

  useEffect(() => {
    if (question.type === 'LONG_TEXT') {
      textareaRef.current?.focus()
    } else {
      inputRef.current?.focus()
    }
    setValidationError(null)
  }, [question.id, question.type])

  function handleSubmit() {
    if (question.required && !value.trim()) {
      setShake(true)
      return
    }
    const err = getValidationError(question, value)
    if (err) {
      setValidationError(err)
      setShake(true)
      return
    }
    setValidationError(null)
    onSubmit()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const sharedClasses =
    'w-full bg-transparent border-b border-white/20 text-white text-xl placeholder:text-white/30 outline-none pb-2 focus:border-white/60 transition-colors duration-150'

  const placeholder = question.placeholder?.trim() || defaultPlaceholder(question)

  return (
    <m.div
      animate={shake ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => setShake(false)}
    >
      {question.type === 'LONG_TEXT' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); setValidationError(null) }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={4}
          className={`${sharedClasses} resize-none`}
        />
      ) : question.textInputType === 'phone' ? (
        <PhoneQuestion
          ref={inputRef}
          value={value}
          onChange={(v) => { onChange(v); setValidationError(null) }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      ) : question.textInputType === 'country' ? (
        <CountryQuestion
          ref={inputRef}
          value={value}
          onChange={(v) => { onChange(v); setValidationError(null) }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
      ) : (
        <input
          ref={inputRef}
          type={htmlInputType(question)}
          inputMode={question.textInputType === 'url' ? 'url' : question.textInputType === 'email' ? 'email' : 'text'}
          value={value}
          onChange={(e) => { onChange(e.target.value); setValidationError(null) }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={sharedClasses}
        />
      )}
      {validationError && (
        <p className="mt-2 text-red-400 text-sm">{validationError}</p>
      )}
    </m.div>
  )
})
