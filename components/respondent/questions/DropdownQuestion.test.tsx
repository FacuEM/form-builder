import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
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
  it('renders a trigger button with placeholder text', () => {
    render(<DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByRole('button', { name: /select an option/i })).toBeInTheDocument()
  })

  it('opens the list when trigger is clicked', () => {
    render(<DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /select an option/i }))
    expect(screen.getByText('USA')).toBeInTheDocument()
    expect(screen.getByText('Canada')).toBeInTheDocument()
  })

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn()
    render(<DropdownQuestion question={question} value="" onChange={onChange} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /select an option/i }))
    fireEvent.click(screen.getByText('USA'))
    expect(onChange).toHaveBeenCalledWith('USA')
  })

  it('closes the list after selecting an option', async () => {
    render(<DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /select an option/i }))
    fireEvent.click(screen.getByText('Canada'))
    await waitFor(() => expect(screen.queryByRole('list')).not.toBeInTheDocument())
  })

  it('does not call onSubmit automatically after selecting', () => {
    const onSubmit = vi.fn()
    render(<DropdownQuestion question={question} value="" onChange={vi.fn()} onSubmit={onSubmit} />)
    fireEvent.click(screen.getByRole('button', { name: /select an option/i }))
    fireEvent.click(screen.getByText('USA'))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows selected value in trigger after selection', () => {
    render(<DropdownQuestion question={question} value="Canada" onChange={vi.fn()} onSubmit={vi.fn()} />)
    expect(screen.getByText('Canada')).toBeInTheDocument()
  })
})
