import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockIsTouchDevice = vi.fn()
vi.mock('@/lib/touchDetect', () => ({ detectTouchDevice: () => mockIsTouchDevice() }))

// Import AFTER mock is set up
const { NavigationHint } = await import('./NavigationHint')

describe('NavigationHint (desktop)', () => {
  beforeEach(() => {
    mockIsTouchDevice.mockReturnValue(false)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the Enter hint element', () => {
    render(<NavigationHint onContinue={vi.fn()} />)
    expect(screen.getByText(/Enter/i)).toBeInTheDocument()
  })

  it('shows Enter hint after 800ms (opacity controlled by framer-motion)', () => {
    render(<NavigationHint onContinue={vi.fn()} />)
    act(() => { vi.advanceTimersByTime(800) })
    expect(screen.getByText(/Enter/i)).toBeInTheDocument()
  })

  it('clears timer on unmount without error', () => {
    const { unmount } = render(<NavigationHint onContinue={vi.fn()} />)
    unmount()
    expect(() => act(() => { vi.advanceTimersByTime(800) })).not.toThrow()
  })
})

describe('NavigationHint (mobile)', () => {
  beforeEach(() => {
    mockIsTouchDevice.mockReturnValue(true)
  })

  it('renders a Continue button on touch devices', () => {
    render(<NavigationHint onContinue={vi.fn()} />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument()
  })

  it('calls onContinue when Continue button is clicked', () => {
    const onContinue = vi.fn()
    render(<NavigationHint onContinue={onContinue} />)
    screen.getByRole('button', { name: /continue/i }).click()
    expect(onContinue).toHaveBeenCalled()
  })

  it('disables the Continue button when disabled prop is true', () => {
    render(<NavigationHint onContinue={vi.fn()} disabled />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })
})
