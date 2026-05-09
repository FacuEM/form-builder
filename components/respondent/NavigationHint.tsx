'use client'

import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useSyncExternalStore, useState } from 'react'
import { detectTouchDevice } from '@/lib/touchDetect'

const subscribe = () => () => {}
const useTouchDevice = () =>
  useSyncExternalStore(subscribe, detectTouchDevice, () => false)

interface Props {
  onContinue: (value?: string) => void
  disabled?: boolean
  /**
   * Whether the user has provided an answer for the current question.
   * Defaults to true so STATEMENT / WELCOME slides keep their existing affordance.
   */
  hasAnswer?: boolean
}

export function NavigationHint({ onContinue, disabled, hasAnswer = true }: Props) {
  const [hintVisible, setHintVisible] = useState(false)
  const isTouchDevice = useTouchDevice()

  useEffect(() => {
    setHintVisible(false)
    const timer = setTimeout(() => setHintVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  // Touch devices: keep tap target visible but disable until answered.
  if (isTouchDevice) {
    return (
      <div className="mt-8" suppressHydrationWarning>
        <AnimatePresence>
          {hasAnswer && (
            <ContinueButton key="btn" onClick={() => onContinue()} disabled={disabled} />
          )}
        </AnimatePresence>
        {!hasAnswer && (
          <button
            disabled
            className="px-6 py-3 bg-white/10 text-white/40 font-medium rounded-lg"
          >
            Continue →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mt-8 flex items-center gap-4 min-h-[48px]" suppressHydrationWarning>
      <AnimatePresence mode="wait">
        {hasAnswer ? (
          <ContinueButton key="btn" onClick={() => onContinue()} disabled={disabled} />
        ) : (
          <m.div
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: hintVisible ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-white/40 text-sm select-none"
          >
            Press <kbd className="font-mono">Enter</kbd> ↵
          </m.div>
        )}
      </AnimatePresence>
      {hasAnswer && (
        <m.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/40 text-xs select-none"
        >
          or press <kbd className="font-mono">Enter</kbd> ↵
        </m.span>
      )}
    </div>
  )
}

interface ContinueButtonProps {
  onClick: () => void
  disabled?: boolean
}

function ContinueButton({ onClick, disabled }: ContinueButtonProps) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: [
          '0 0 0 0 rgba(255,255,255,0.0)',
          '0 0 0 6px rgba(255,255,255,0.08)',
          '0 0 0 0 rgba(255,255,255,0.0)',
        ],
      }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{
        opacity: { duration: 0.25 },
        y: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
        scale: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
        boxShadow: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span>Continue</span>
      <m.span
        aria-hidden
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block"
      >
        →
      </m.span>
    </m.button>
  )
}
