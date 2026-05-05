'use client'

import { motion } from 'framer-motion'

interface Props {
  message: string
}

export function ThankYouScreen({ message }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center justify-center min-h-screen text-center px-6"
    >
      <p className="text-white text-3xl font-light">{message}</p>
    </motion.div>
  )
}
