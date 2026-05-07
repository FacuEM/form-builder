'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteForm, updateForm } from '@/app/actions/form'

interface Form {
  id: string
  title: string
  published: boolean
  _count: { responses: number }
}

export function FormsList({ forms }: { forms: Form[] }) {
  if (forms.length === 0) {
    return <p className="text-white/30 text-sm">No forms yet. Create one to get started.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {forms.map((form) => (
        <FormRow key={form.id} form={form} />
      ))}
    </div>
  )
}

function FormRow({ form }: { form: Form }) {
  const router = useRouter()
  const [renaming, setRenaming] = useState(false)
  const [title, setTitle] = useState(form.title)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function commitRename() {
    const trimmed = title.trim() || 'Untitled form'
    setRenaming(false)
    if (trimmed === form.title) {
      setTitle(form.title)
      return
    }
    setSaving(true)
    await updateForm(form.id, { title: trimmed })
    setSaving(false)
    router.refresh()
  }

  async function copyLink(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/forms/${form.id}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between px-4 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex-1 min-w-0">
        {renaming ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') {
                setTitle(form.title)
                setRenaming(false)
              }
            }}
            className="w-full bg-transparent border-b border-white/20 text-white text-sm font-medium outline-none focus:border-white/60"
          />
        ) : (
          <Link href={`/dashboard/forms/${form.id}/edit`} className="block">
            <p className="text-white text-sm font-medium truncate">
              {saving ? title : form.title}
            </p>
            <p className="text-white/30 text-xs mt-0.5">
              {form._count.responses} response{form._count.responses !== 1 ? 's' : ''} ·{' '}
              {form.published ? (
                <span className="text-green-400/60">Published</span>
              ) : (
                <span>Draft</span>
              )}
            </p>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {form.published && (
          <button
            type="button"
            onClick={copyLink}
            className="text-white/40 hover:text-white text-xs transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        )}
        <button
          type="button"
          onClick={() => setRenaming(true)}
          className="text-white/40 hover:text-white text-sm transition-colors"
          aria-label="Rename"
        >
          Rename
        </button>
        <Link
          href={`/dashboard/forms/${form.id}/edit`}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          Edit →
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete "${form.title}"? This cannot be undone.`)) {
              deleteForm(form.id)
            }
          }}
          className="text-white/30 hover:text-red-400 text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
