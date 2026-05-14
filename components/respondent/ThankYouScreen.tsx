'use client'

import { useEffect } from 'react'
import { m } from 'framer-motion'
import confetti from 'canvas-confetti'

interface Props {
  title: string
  description?: string
}

export function ThankYouScreen({ title, description }: Props) {
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-xl"
      >
        <h1 className="text-white text-4xl font-light mb-4 leading-tight">{title}</h1>
        {description && (
          <p className="text-white/50 text-lg font-light leading-relaxed whitespace-pre-line">{description}</p>
        )}
      </m.div>
    </div>
  )
}
