'use client'

import { motion } from 'framer-motion'

interface Props {
  title: string
  description?: string
}

export function ThankYouScreen({ title, description }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-start justify-center min-h-screen px-6 max-w-xl mx-auto"
    >
      <h1 className="text-white text-4xl font-light mb-4 leading-tight">{title}</h1>
      {description && (
        <p className="text-white/50 text-lg font-light leading-relaxed">{description}</p>
      )}
    </motion.div>
  )
}
