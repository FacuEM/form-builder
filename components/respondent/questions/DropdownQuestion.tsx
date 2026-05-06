'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '@/types'

interface Props {
  question: Question
  value: string
  onChange: (value: string) => void
  onSubmit: (value?: string) => void
  disabled?: boolean
}

export function DropdownQuestion({ question, value, onChange, onSubmit, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const choices = question.choices.slice().sort((a, b) => a.order - b.order)

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Enter') {
        if (open) {
          if (highlighted >= 0 && highlighted < choices.length) {
            const label = choices[highlighted].label
            onChange(label)
            setOpen(false)
          } else {
            setOpen(false)
          }
        } else if (value) {
          onSubmit()
        } else {
          setOpen(true)
        }
        return
      }
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!open) { setOpen(true); setHighlighted(0); return }
        setHighlighted((h) => Math.min(h + 1, choices.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted((h) => Math.max(h - 1, 0))
        return
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, highlighted, choices, value, onChange, onSubmit])

  function select(label: string) {
    onChange(label)
    setOpen(false)
    setHighlighted(-1)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors duration-150 ${
          open
            ? 'border-white/60 bg-white/5'
            : 'border-white/20 bg-white/5 hover:border-white/40'
        } disabled:opacity-40`}
      >
        <span className={`text-xl ${value ? 'text-white' : 'text-white/30'}`}>
          {value || 'Select an option'}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.15 }}
          className="text-white/40 text-sm ml-3 shrink-0"
        >
          ↓
        </motion.span>
      </button>

      {/* Dropdown list */}
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 w-full mt-2 rounded-lg border border-white/20 bg-[#111] overflow-hidden shadow-2xl"
          >
            {choices.map((choice, i) => (
              <li key={choice.id}>
                <button
                  type="button"
                  onClick={() => select(choice.label)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 ${
                    highlighted === i
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  } ${value === choice.label ? 'text-white' : ''}`}
                >
                  <span className="text-xs font-mono opacity-40 w-5 shrink-0">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][i] ?? String(i + 1)}
                  </span>
                  <span>{choice.label}</span>
                  {value === choice.label && (
                    <span className="ml-auto text-white/60 text-xs">✓</span>
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
