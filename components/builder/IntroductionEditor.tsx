'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  content: Record<string, unknown> | null
  onBlur: (content: Record<string, unknown>) => void
}

type ToolbarButtonProps = {
  onClick: () => void
  active: boolean
  label: string
  title: string
}

function ToolbarButton({ onClick, active, label, title }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
        active ? 'bg-white text-black' : 'text-white/50 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  )
}

export function IntroductionEditor({ content, onBlur }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content ?? undefined,
    onBlur: ({ editor }) => {
      onBlur(editor.getJSON() as Record<string, unknown>)
    },
    editorProps: {
      attributes: {
        class:
          'outline-none min-h-[120px] text-white/80 text-sm leading-relaxed prose prose-sm prose-invert max-w-none',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 p-1.5 bg-white/5 rounded border border-white/10">
        <ToolbarButton
          title="Heading 1"
          label="H1"
          active={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          title="Heading 2"
          label="H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          title="Heading 3"
          label="H3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <span className="w-px bg-white/10 mx-0.5" />
        <ToolbarButton
          title="Bold"
          label="B"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          title="Italic"
          label="I"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <span className="w-px bg-white/10 mx-0.5" />
        <ToolbarButton
          title="Blockquote"
          label="❝"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          title="Bullet list"
          label="•—"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          title="Ordered list"
          label="1."
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
      </div>
      <div className="border border-white/20 rounded px-3 py-2 focus-within:border-white/40 transition-colors">
        <EditorContent editor={editor} />
      </div>
      <p className="text-white/30 text-[11px]">Click elsewhere to save changes.</p>
    </div>
  )
}
