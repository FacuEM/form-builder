'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  content: Record<string, unknown> | null | undefined
  className?: string
}

export function RichTextContent({ content, className }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? undefined,
    editable: false,
    editorProps: {
      attributes: {
        class: `outline-none prose prose-sm sm:prose prose-invert max-w-none ${className ?? ''}`,
        style:
          '--tw-prose-body: rgba(255,255,255,0.5); --tw-prose-headings: #ffffff; --tw-prose-lead: rgba(255,255,255,0.7); --tw-prose-bold: #ffffff; --tw-prose-counters: rgba(255,255,255,0.7); --tw-prose-bullets: rgba(255,255,255,0.5); --tw-prose-quotes: rgba(255,255,255,0.85); --tw-prose-quote-borders: rgba(255,255,255,0.25); --tw-prose-links: #ffffff;',
      },
    },
  })

  if (!editor) return null
  return <EditorContent editor={editor} />
}
