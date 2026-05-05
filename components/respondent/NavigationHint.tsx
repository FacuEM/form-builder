'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  onContinue: (value?: string) => void
  disabled?: boolean
}

export function NavigationHint({ onContinue, disabled }: Props) {
  const [visible, setVisible] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isTouchDevice) {
    return (
      <button
        onClick={() => onContinue()}
        disabled={disabled}
        className="mt-8 px-6 py-3 bg-white text-black font-medium rounded-lg disabled:opacity-40 transition-opacity"
      >
        Continue →
      </button>
    )
  }

  return (
    <motion.div
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 text-white/40 text-sm select-none"
    >
      Press <kbd className="font-mono">Enter</kbd> ↵
    </motion.div>
  )
}
