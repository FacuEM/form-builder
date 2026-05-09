'use client'

import { m } from 'framer-motion'

interface Props {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((current / total) * 100)

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/10 z-50">
      <m.div
        className="h-full bg-white"
        animate={{ width: `${pct}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  )
}
