import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DropdownQuestion } from './DropdownQuestion'

const question = {
  id: 'q1',
  formId: 'f1',
  order: 0,
  text: 'Choose a country',
  type: 'DROPDOWN' as const,
  required: true,
  choices: [
    { id: 'c1', questionId: 'q1', label: 'USA', order: 0 },
    { id: 'c2', questionId: 'q1', label: 'Canada', order: 1 },
  ],
  answers: [],
}

describe('DropdownQuestion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a select with all choices', () => {
    render(
      <DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={vi.fn()} />
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('USA')).toBeInTheDocument()
    expect(screen.getByText('Canada')).toBeInTheDocument()
  })

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn()
    render(
      <DropdownQuestion question={question} value="" onChange={onChange} onSubmit={vi.fn()} />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'USA' } })
    expect(onChange).toHaveBeenCalledWith('USA')
  })

  it('calls onSubmit with the selected value after 300ms', () => {
    const onSubmit = vi.fn()
    render(
      <DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={onSubmit} />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Canada' } })
    expect(onSubmit).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(300) })
    expect(onSubmit).toHaveBeenCalledWith('Canada')
  })

  it('does not call onSubmit before 300ms', () => {
    const onSubmit = vi.fn()
    render(
      <DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={onSubmit} />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'USA' } })
    act(() => { vi.advanceTimersByTime(299) })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('clears the timer on unmount (no state update on unmounted component)', () => {
    const onSubmit = vi.fn()
    const { unmount } = render(
      <DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={onSubmit} />
    )
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'USA' } })
    unmount()
    act(() => { vi.advanceTimersByTime(300) })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
