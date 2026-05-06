'use client'

import { useState } from 'react'
import {
  updateQuestion,
  updateQuestionType,
  createChoice,
  updateChoice,
  deleteChoice,
} from '@/app/actions/form'
import type { Question } from '@/types'

const TYPES = [
  { value: 'TEXT', label: 'Short text' },
  { value: 'LONG_TEXT', label: 'Long text' },
  { value: 'CHOICE', label: 'Choice' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'STATEMENT', label: 'Title' },
  { value: 'WELCOME', label: 'Introduction' },
] as const

type QuestionType = (typeof TYPES)[number]['value']

const CONTENT_ONLY_TYPES = new Set(['STATEMENT', 'WELCOME'])

interface Props {
  question: Question
  formId: string
}

export function QuestionEditor({ question, formId }: Props) {
  const [confirmTypeSwitch, setConfirmTypeSwitch] = useState<QuestionType | null>(null)

  function handleTypeChange(type: QuestionType) {
    const hasChoices = question.choices.length > 0
    const switchingToNonChoice = type === 'TEXT' || type === 'LONG_TEXT' || CONTENT_ONLY_TYPES.has(type)
    if (hasChoices && switchingToNonChoice) {
      setConfirmTypeSwitch(type)
      return
    }
    updateQuestionType(question.id, formId, type, false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Text field */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
          {question.type === 'WELCOME' ? 'Title' : question.type === 'STATEMENT' ? 'Content' : 'Question'}
        </label>
        <textarea
          defaultValue={question.text}
          onBlur={(e) => updateQuestion(question.id, formId, { text: e.target.value })}
          rows={3}
          className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors resize-none"
        />
      </div>

      {/* Description field — only for WELCOME */}
      {question.type === 'WELCOME' && (
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Description</label>
          <textarea
            defaultValue={question.description ?? ''}
            onBlur={(e) => updateQuestion(question.id, formId, { description: e.target.value })}
            rows={3}
            placeholder="Optional subtitle or instructions..."
            className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors resize-none placeholder:text-white/20"
          />
        </div>
      )}

      {/* Type picker */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                question.type === t.value
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {confirmTypeSwitch && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg">
            <p className="text-white/70 text-sm mb-3">
              Switching type will remove existing choices. Continue?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateQuestionType(question.id, formId, confirmTypeSwitch, true)
                  setConfirmTypeSwitch(null)
                }}
                className="px-3 py-1.5 bg-white text-black text-sm rounded-lg"
              >
                Yes, remove choices
              </button>
              <button
                onClick={() => setConfirmTypeSwitch(null)}
                className="px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Choices list — hidden for content-only types */}
      {(question.type === 'CHOICE' || question.type === 'DROPDOWN') && (
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Options</label>
          <div className="flex flex-col gap-2">
            {question.choices
              .sort((a, b) => a.order - b.order)
              .map((choice) => (
                <div key={choice.id} className="flex items-center gap-2">
                  <input
                    defaultValue={choice.label}
                    onBlur={(e) => updateChoice(choice.id, formId, e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
                  />
                  <form action={deleteChoice.bind(null, choice.id, formId)}>
                    <button type="submit" className="text-white/30 hover:text-red-400 transition-colors text-sm">
                      ✕
                    </button>
                  </form>
                </div>
              ))}
            <form action={createChoice.bind(null, question.id, formId)}>
              <button
                type="submit"
                className="text-white/40 hover:text-white text-sm transition-colors mt-1"
              >
                + Add option
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Required toggle — hidden for content-only types */}
      {!CONTENT_ONLY_TYPES.has(question.type) && (
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-sm">Required</p>
          <button
            onClick={() => updateQuestion(question.id, formId, { required: !question.required })}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              question.required ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                question.required ? 'left-6 bg-black' : 'left-1 bg-white/60'
              }`}
            />
          </button>
        </div>
      )}
    </div>
  )
}
