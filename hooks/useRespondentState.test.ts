import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useRespondentState } from './useRespondentState'

describe('useRespondentState', () => {
  it('starts at index 0 with direction forward', () => {
    const { result } = renderHook(() => useRespondentState(3))
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.direction).toBe('forward')
  })

  it('navigate forward advances index', () => {
    const { result } = renderHook(() => useRespondentState(3))
    act(() => result.current.navigate('forward'))
    expect(result.current.currentIndex).toBe(1)
    expect(result.current.direction).toBe('forward')
  })

  it('navigate back decrements index', () => {
    const { result } = renderHook(() => useRespondentState(3))
    act(() => result.current.navigate('forward'))
    act(() => result.current.navigate('back'))
    expect(result.current.currentIndex).toBe(0)
    expect(result.current.direction).toBe('back')
  })

  it('navigate back from index 0 is a no-op', () => {
    const { result } = renderHook(() => useRespondentState(3))
    act(() => result.current.navigate('back'))
    expect(result.current.currentIndex).toBe(0)
  })

  it('navigate forward past last question is a no-op', () => {
    const { result } = renderHook(() => useRespondentState(2))
    act(() => result.current.navigate('forward'))
    act(() => result.current.navigate('forward')) // at boundary now
    expect(result.current.currentIndex).toBe(1)
  })

  it('setAnswer stores value by questionId', () => {
    const { result } = renderHook(() => useRespondentState(3))
    act(() => result.current.setAnswer('q1', 'hello'))
    expect(result.current.answers['q1']).toBe('hello')
  })

  it('directionRef freezes at navigate call time', () => {
    const { result } = renderHook(() => useRespondentState(3))
    act(() => result.current.navigate('forward'))
    // direction ref should read 'forward' even before re-render
    expect(result.current.direction).toBe('forward')
    act(() => result.current.navigate('back'))
    expect(result.current.direction).toBe('back')
  })
})
