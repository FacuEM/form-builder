'use client'

import { useEffect, useRef } from 'react'
import type { Question } from '@/types'

interface Props {
  question: Question
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  disabled?: boolean
}

export function DropdownQuestion({ question, value, onChange, onSubmit, disabled }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const label = e.target.value
    onChange(label)
    // Pass label explicitly so onSubmit sees the value even if closure is stale
    timerRef.current = setTimeout(() => onSubmit(label), 300)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className="w-full bg-white/5 border border-white/20 text-white text-xl rounded-lg px-4 py-3 outline-none focus:border-white/60 transition-colors duration-150 appearance-none cursor-pointer"
    >
      <option value="" disabled className="bg-[#0d0d0d]">
        Select an option...
      </option>
      {question.choices.map((choice) => (
        <option key={choice.id} value={choice.label} className="bg-[#0d0d0d]">
          {choice.label}
        </option>
      ))}
    </select>
  )
}
