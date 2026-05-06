'use client'

import { useState, useEffect } from 'react'
import type { Question } from '@/types'

const TYPES = [
  { value: 'TEXT', label: 'Short text' },
  { value: 'LONG_TEXT', label: 'Long text' },
  { value: 'CHOICE', label: 'Choice' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'STATEMENT', label: 'Title' },
] as const

type QuestionType = (typeof TYPES)[number]['value']

const CONTENT_ONLY_TYPES = new Set<QuestionType>(['STATEMENT'])

interface Props {
  question: Question
  onUpdateQuestion: (id: string, data: { text?: string; description?: string; required?: boolean }) => void
  onUpdateQuestionType: (id: string, type: Question['type'], deleteChoices: boolean) => void
  onCreateChoice: (questionId: string) => void
  onUpdateChoice: (choiceId: string, questionId: string, label: string) => void
  onDeleteChoice: (choiceId: string, questionId: string) => void
}

export function QuestionEditor({
  question,
  onUpdateQuestion,
  onUpdateQuestionType,
  onCreateChoice,
  onUpdateChoice,
  onDeleteChoice,
}: Props) {
  const [localType, setLocalType] = useState<QuestionType>(question.type as QuestionType)
  const [confirmTypeSwitch, setConfirmTypeSwitch] = useState<QuestionType | null>(null)

  // Sync localType when a different question is selected
  useEffect(() => {
    setLocalType(question.type as QuestionType)
    setConfirmTypeSwitch(null)
  }, [question.id, question.type])

  function handleTypeChange(type: QuestionType) {
    const hasChoices = question.choices.length > 0
    const switchingToNonChoice = type === 'TEXT' || type === 'LONG_TEXT' || CONTENT_ONLY_TYPES.has(type)
    if (hasChoices && switchingToNonChoice) {
      setConfirmTypeSwitch(type)
      return
    }
    setLocalType(type)
    onUpdateQuestionType(question.id, type, false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Text field */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
          {localType === 'STATEMENT' ? 'Content' : 'Question'}
        </label>
        <textarea
          key={question.id}
          defaultValue={question.text}
          onBlur={(e) => onUpdateQuestion(question.id, { text: e.target.value })}
          rows={3}
          className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors resize-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Description <span className="normal-case text-white/20">(optional)</span></label>
        <textarea
          key={`${question.id}-desc`}
          defaultValue={question.description ?? ''}
          onBlur={(e) => onUpdateQuestion(question.id, { description: e.target.value })}
          rows={2}
          placeholder="Add a description or hint..."
          className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors resize-none text-sm placeholder:text-white/20"
        />
      </div>

      {/* Type picker */}
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                localType === t.value
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
                  setLocalType(confirmTypeSwitch)
                  onUpdateQuestionType(question.id, confirmTypeSwitch, true)
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

      {/* Choices list */}
      {(localType === 'CHOICE' || localType === 'DROPDOWN') && (
        <div>
          <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Options</label>
          <div className="flex flex-col gap-2">
            {question.choices
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((choice) => (
                <div key={choice.id} className="flex items-center gap-2">
                  <input
                    defaultValue={choice.label}
                    onBlur={(e) => onUpdateChoice(choice.id, question.id, e.target.value)}
                    className="flex-1 bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
                  />
                  <button
                    onClick={() => onDeleteChoice(choice.id, question.id)}
                    className="text-white/30 hover:text-red-400 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            <button
              onClick={() => onCreateChoice(question.id)}
              className="text-white/40 hover:text-white text-sm transition-colors mt-1 text-left"
            >
              + Add option
            </button>
          </div>
        </div>
      )}

      {/* Required toggle */}
      {!CONTENT_ONLY_TYPES.has(localType) && (
        <div className="flex items-center justify-between">
          <p className="text-white/70 text-sm">Required</p>
          <button
            onClick={() => onUpdateQuestion(question.id, { required: !question.required })}
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
