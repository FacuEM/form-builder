'use client'

import Link from 'next/link'
import { deleteForm } from '@/app/actions/form'

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
        <div
          key={form.id}
          className="flex items-center justify-between px-4 py-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group"
        >
          <Link
            href={`/dashboard/forms/${form.id}/edit`}
            className="flex-1 min-w-0"
          >
            <p className="text-white text-sm font-medium truncate">{form.title}</p>
            <p className="text-white/30 text-xs mt-0.5">
              {form._count.responses} response{form._count.responses !== 1 ? 's' : ''} ·{' '}
              {form.published ? (
                <span className="text-green-400/60">Published</span>
              ) : (
                <span>Draft</span>
              )}
            </p>
          </Link>

          <div className="flex items-center gap-3 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
              href={`/dashboard/forms/${form.id}/edit`}
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              Edit →
            </Link>
            <button
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
      ))}
    </div>
  )
}
