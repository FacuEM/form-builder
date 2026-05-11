'use client'

import { m } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { Question } from '@/types'

// Value is stored as a JSON-serialised string array, e.g. '["Option A","Option C"]'
function parseValue(v: string): string[] {
  if (!v) return []
  try { return JSON.parse(v) } catch { return [] }
}

function serialise(selected: string[]): string {
  return selected.length ? JSON.stringify(selected) : ''
}

const OTHER_SENTINEL = '__other__: '

function getOtherEntry(selected: string[]): string | undefined {
  return selected.find((s) => s.startsWith(OTHER_SENTINEL))
}

interface Props {
  question: Question
  value: string          // serialised JSON array
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  disabled?: boolean
}

export function MultiSelectQuestion({ question, value, onChange, onSubmit, disabled }: Props) {
  const [shake, setShake] = useState(false)
  const otherInputRef = useRef<HTMLInputElement>(null)
  const selected = parseValue(value)
  const otherEntry = getOtherEntry(selected)
  const isOtherSelected = otherEntry !== undefined
  const otherText = otherEntry ? otherEntry.slice(OTHER_SENTINEL.length) : ''

  // Keyboard: Enter to continue
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        if (question.required && selected.length === 0) {
          setShake(true)
          return
        }
        onSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [question.required, selected, onSubmit])

  function toggle(label: string) {
    const next = selected.includes(label)
      ? selected.filter((s) => s !== label)
      : [...selected, label]
    onChange(serialise(next))
  }

  function toggleOther() {
    if (isOtherSelected) {
      onChange(serialise(selected.filter((s) => !s.startsWith(OTHER_SENTINEL))))
    } else {
      onChange(serialise([...selected, OTHER_SENTINEL]))
      setTimeout(() => otherInputRef.current?.focus(), 0)
    }
  }

  function updateOtherText(text: string) {
    const next = selected.map((s) => (s.startsWith(OTHER_SENTINEL) ? OTHER_SENTINEL + text : s))
    onChange(serialise(next))
  }

  return (
    <m.div
      className="flex flex-col gap-3"
      animate={shake ? { x: [0, -8, 8, -8, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={() => setShake(false)}
    >
      {question.choices
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((choice) => {
          const isSelected = selected.includes(choice.label)
          return (
            <button
              key={choice.id}
              disabled={disabled}
              onClick={() => toggle(choice.label)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-150 ${
                isSelected
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white'
              }`}
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected ? 'bg-white border-white' : 'border-white/30'
                }`}
              >
                {isSelected && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span>{choice.label}</span>
            </button>
          )
        })}

      {question.allowOther && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 ${
            isOtherSelected
              ? 'border-white bg-white/10 text-white'
              : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white'
          }`}
        >
          <button
            disabled={disabled}
            onClick={toggleOther}
            className="shrink-0"
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                isOtherSelected ? 'bg-white border-white' : 'border-white/30'
              }`}
            >
              {isOtherSelected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
          {isOtherSelected ? (
            <input
              ref={otherInputRef}
              type="text"
              value={otherText}
              onChange={(e) => updateOtherText(e.target.value)}
              placeholder="Please specify…"
              disabled={disabled}
              className="flex-1 bg-transparent text-white outline-none placeholder:text-white/30 text-sm"
            />
          ) : (
            <button disabled={disabled} onClick={toggleOther} className="flex-1 text-left text-white/70">
              Other…
            </button>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <p className="text-white/30 text-xs mt-1">
          {selected.length} selected · press Enter to continue
        </p>
      )}
    </m.div>
  )
}
