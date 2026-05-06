import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TextQuestion } from './TextQuestion'

const baseQuestion = {
  id: 'q1',
  formId: 'f1',
  order: 0,
  text: 'What is your name?',
  type: 'TEXT' as const,
  required: true,
  choices: [],
  answers: [],
}

describe('TextQuestion', () => {
  it('renders an input for TEXT type', () => {
    render(
      <TextQuestion
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByRole('textbox').tagName).toBe('INPUT')
  })

  it('renders a textarea for LONG_TEXT type', () => {
    render(
      <TextQuestion
        question={{ ...baseQuestion, type: 'LONG_TEXT' }}
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    )
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('calls onChange when typing', () => {
    const onChange = vi.fn()
    render(
      <TextQuestion
        question={baseQuestion}
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
      />
    )
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alice' } })
    expect(onChange).toHaveBeenCalledWith('Alice')
  })

  it('calls onSubmit on Enter when value is present', () => {
    const onSubmit = vi.fn()
    render(
      <TextQuestion
        question={baseQuestion}
        value="Alice"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalled()
  })

  it('does not call onSubmit on Enter when required and empty', () => {
    const onSubmit = vi.fn()
    render(
      <TextQuestion
        question={baseQuestion}
        value=""
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not call onSubmit on Shift+Enter (newline in textarea)', () => {
    const onSubmit = vi.fn()
    render(
      <TextQuestion
        question={{ ...baseQuestion, type: 'LONG_TEXT' }}
        value="hello"
        onChange={vi.fn()}
        onSubmit={onSubmit}
      />
    )
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: true })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
