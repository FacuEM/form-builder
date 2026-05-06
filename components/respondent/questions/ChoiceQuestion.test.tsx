import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ChoiceQuestion } from './ChoiceQuestion'

vi.mock('@/lib/touchDetect', () => ({ detectTouchDevice: () => false }))

const question = {
  id: 'q1',
  formId: 'f1',
  order: 0,
  text: 'Pick one',
  type: 'CHOICE' as const,
  required: true,
  choices: [
    { id: 'c1', questionId: 'q1', label: 'Apple', order: 0 },
    { id: 'c2', questionId: 'q1', label: 'Banana', order: 1 },
    { id: 'c3', questionId: 'q1', label: 'Cherry', order: 2 },
  ],
  answers: [],
}

describe('ChoiceQuestion', () => {
  it('renders all choices', () => {
    render(
      <ChoiceQuestion question={question} value="" onChange={vi.fn()} onSubmit={vi.fn()} />
    )
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Cherry')).toBeInTheDocument()
  })

  it('clicking a choice calls onChange with its label', () => {
    const onChange = vi.fn()
    render(
      <ChoiceQuestion question={question} value="" onChange={onChange} onSubmit={vi.fn()} />
    )
    fireEvent.click(screen.getByText('Banana'))
    expect(onChange).toHaveBeenCalledWith('Banana')
  })

  it('pressing A selects the first choice', () => {
    const onChange = vi.fn()
    render(
      <ChoiceQuestion question={question} value="" onChange={onChange} onSubmit={vi.fn()} />
    )
    fireEvent.keyDown(document, { key: 'a' })
    expect(onChange).toHaveBeenCalledWith('Apple')
  })

  it('pressing B selects the second choice', () => {
    const onChange = vi.fn()
    render(
      <ChoiceQuestion question={question} value="" onChange={onChange} onSubmit={vi.fn()} />
    )
    fireEvent.keyDown(document, { key: 'b' })
    expect(onChange).toHaveBeenCalledWith('Banana')
  })

  it('pressing Enter with a value calls onSubmit', () => {
    const onSubmit = vi.fn()
    render(
      <ChoiceQuestion question={question} value="Apple" onChange={vi.fn()} onSubmit={onSubmit} />
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onSubmit).toHaveBeenCalled()
  })

  it('pressing Enter without a value does not call onSubmit (required)', () => {
    const onSubmit = vi.fn()
    render(
      <ChoiceQuestion question={question} value="" onChange={vi.fn()} onSubmit={onSubmit} />
    )
    fireEvent.keyDown(document, { key: 'Enter' })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
