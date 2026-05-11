'use client'

import { useState, useEffect } from 'react'
import type { Question, TextInputType } from '@/types'

const TYPES = [
  { value: 'TEXT', label: 'Short text' },
  { value: 'LONG_TEXT', label: 'Long text' },
  { value: 'CHOICE', label: 'Choice' },
  { value: 'DROPDOWN', label: 'Dropdown' },
  { value: 'MULTI_SELECT', label: 'Multi-select' },
  { value: 'STATEMENT', label: 'Title' },
] as const

type QuestionType = (typeof TYPES)[number]['value']

const CONTENT_ONLY_TYPES = new Set<QuestionType>(['STATEMENT'])
const TEXT_INPUT_TYPES = new Set<QuestionType>(['TEXT', 'LONG_TEXT'])
const CHOICE_TYPES = new Set<QuestionType>(['CHOICE', 'DROPDOWN', 'MULTI_SELECT'])

const TEXT_SUBTYPES: { value: TextInputType; label: string; hint: string }[] = [
  { value: 'text',  label: 'Plain text', hint: 'Any text' },
  { value: 'email', label: 'Email',      hint: 'name@example.com' },
  { value: 'phone', label: 'Phone',      hint: '+1 (555) 000-0000' },
  { value: 'url',   label: 'Link / URL', hint: 'https://…' },
]

interface Props {
  question: Question
  onUpdateQuestion: (
    id: string,
    data: {
      text?: string
      description?: string
      required?: boolean
      scored?: boolean
      textInputType?: TextInputType | null
      placeholder?: string | null
    }
  ) => void
  onUpdateQuestionType: (id: string, type: Question['type'], deleteChoices: boolean) => void
  onCreateChoice: (questionId: string) => void
  onUpdateChoice: (choiceId: string, questionId: string, data: { label?: string; weight?: number }) => void
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
  const [localSubtype, setLocalSubtype] = useState<TextInputType>(question.textInputType ?? 'text')

  // Sync when a different question is selected
  useEffect(() => {
    setLocalType(question.type as QuestionType)
    setLocalSubtype(question.textInputType ?? 'text')
    setConfirmTypeSwitch(null)
  }, [question.id, question.type, question.textInputType])

  function handleTypeChange(type: QuestionType) {
    const hasChoices = question.choices.length > 0
    const switchingToNonChoice = !CHOICE_TYPES.has(type)
    if (hasChoices && switchingToNonChoice) {
      setConfirmTypeSwitch(type)
      return
    }
    setLocalType(type)
    onUpdateQuestionType(question.id, type as Question['type'], false)
  }

  function handleSubtypeChange(sub: TextInputType) {
    setLocalSubtype(sub)
    onUpdateQuestion(question.id, { textInputType: sub })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Text / content field */}
      <div>
        <label htmlFor="question-text" className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
          {localType === 'STATEMENT' ? 'Content' : 'Question'}
        </label>
        <textarea
          id="question-text"
          key={question.id}
          defaultValue={question.text}
          onBlur={(e) => onUpdateQuestion(question.id, { text: e.target.value })}
          rows={3}
          className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors resize-none"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="question-desc" className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
          Description <span className="normal-case text-white/20">(optional)</span>
        </label>
        <textarea
          id="question-desc"
          key={`${question.id}-desc`}
          defaultValue={question.description ?? ''}
          onBlur={(e) => onUpdateQuestion(question.id, { description: e.target.value })}
          rows={2}
          placeholder="Add a description or hint..."
          className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors resize-none text-sm placeholder:text-white/20"
        />
      </div>

      {/* Placeholder (text-based types only) */}
      {TEXT_INPUT_TYPES.has(localType) && (
        <div>
          <label htmlFor="question-placeholder" className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
            Placeholder <span className="normal-case text-white/20">(optional)</span>
          </label>
          <input
            id="question-placeholder"
            key={`${question.id}-placeholder`}
            type="text"
            defaultValue={question.placeholder ?? ''}
            onBlur={(e) =>
              onUpdateQuestion(question.id, { placeholder: e.target.value || null })
            }
            placeholder="e.g. Type your answer here…"
            className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors text-sm placeholder:text-white/20"
          />
        </div>
      )}

      {/* Type picker */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Type</p>
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
                  onUpdateQuestionType(question.id, confirmTypeSwitch as Question['type'], true)
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

      {/* Text input subtype picker (TEXT only) */}
      {localType === 'TEXT' && (
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Input format</p>
          <div className="grid grid-cols-2 gap-1.5">
            {TEXT_SUBTYPES.map((sub) => (
              <button
                key={sub.value}
                onClick={() => handleSubtypeChange(sub.value)}
                className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  localSubtype === sub.value
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="block">{sub.label}</span>
                <span className={`text-xs mt-0.5 block ${localSubtype === sub.value ? 'text-black/50' : 'text-white/30'}`}>
                  {sub.hint}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Choices list — CHOICE, DROPDOWN, MULTI_SELECT */}
      {CHOICE_TYPES.has(localType) && (
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Options</p>
          {localType === 'MULTI_SELECT' && (
            <p className="text-white/30 text-xs mb-3">Respondents can select multiple options.</p>
          )}
          <div className="flex flex-col gap-2">
            {question.choices
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((choice) => (
                <div key={choice.id} className="flex items-center gap-2">
                  <input
                    defaultValue={choice.label}
                    onBlur={(e) => onUpdateChoice(choice.id, question.id, { label: e.target.value })}
                    className="flex-1 bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
                  />
                  {question.scored && (
                    <input
                      key={`${choice.id}-w`}
                      type="number"
                      defaultValue={choice.weight}
                      onBlur={(e) =>
                        onUpdateChoice(choice.id, question.id, { weight: Number(e.target.value) || 0 })
                      }
                      title="Weight"
                      className="w-14 bg-transparent border border-white/20 rounded text-white outline-none px-2 py-1 focus:border-white/60 transition-colors text-sm text-center"
                    />
                  )}
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

          {/* Score toggle — not available for MULTI_SELECT */}
          {localType !== 'MULTI_SELECT' && (
            <div className="flex items-center justify-between mt-5">
              <div>
                <p className="text-white/70 text-sm">Score this question</p>
                <p className="text-white/30 text-xs mt-0.5">Assign a weight to each option to rank responses</p>
              </div>
              <button
                onClick={() => onUpdateQuestion(question.id, { scored: !question.scored })}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                  question.scored ? 'bg-white' : 'bg-white/20'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                    question.scored ? 'left-6 bg-black' : 'left-1 bg-white/60'
                  }`}
                />
              </button>
            </div>
          )}
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
