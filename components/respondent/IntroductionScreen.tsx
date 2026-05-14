'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'

interface Props {
  title: string
  content: Record<string, unknown> | null
  onContinue: () => void
}

export function IntroductionScreen({ title, content, onContinue }: Props) {
  const [canContinue, setCanContinue] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? undefined,
    editable: false,
    editorProps: {
      attributes: {
        class: 'outline-none prose prose-sm sm:prose max-w-none [--tw-prose-body:theme(colors.white/90)] [--tw-prose-headings:theme(colors.white)] [--tw-prose-lead:theme(colors.white/80)] [--tw-prose-links:theme(colors.white)] [--tw-prose-bold:theme(colors.white)] [--tw-prose-counters:theme(colors.white/70)] [--tw-prose-bullets:theme(colors.white/50)] [--tw-prose-hr:theme(colors.white/20)] [--tw-prose-quotes:theme(colors.white)] [--tw-prose-quote-borders:theme(colors.white/30)] [--tw-prose-captions:theme(colors.white/60)] [--tw-prose-code:theme(colors.white)] [--tw-prose-pre-code:theme(colors.white/90)] [--tw-prose-pre-bg:theme(colors.white/5)] [--tw-prose-th-borders:theme(colors.white/20)] [--tw-prose-td-borders:theme(colors.white/10)]',
      },
    },
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCanContinue(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-white text-4xl font-light mb-8 leading-tight">{title}</h1>

        {editor && <EditorContent editor={editor} />}

        <div ref={sentinelRef} className="mt-4" />

        <div className="mt-12 flex flex-col items-start gap-4 min-h-[60px]">
          <AnimatePresence mode="wait">
            {canContinue ? (
              <m.button
                key="btn"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={onContinue}
                className="px-8 py-3.5 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors min-h-[44px]"
              >
                Continue →
              </m.button>
            ) : (
              <m.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="text-white/40 text-sm select-none"
              >
                Scroll to continue ↓
              </m.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
