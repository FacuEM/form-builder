'use client'

import { updateForm } from '@/app/actions/form'
import { useState } from 'react'
import type { Form } from '@/types'

interface Props {
  form: Form
}

export function SettingsPanel({ form }: Props) {
  const [published, setPublished] = useState(form.published)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Form title</label>
        <input
          defaultValue={form.title}
          onBlur={(e) => updateForm(form.id, { title: e.target.value })}
          className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors"
        />
      </div>

      <div>
        <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Thank-you message</label>
        <input
          defaultValue={form.thankYouMessage}
          onBlur={(e) => updateForm(form.id, { thankYouMessage: e.target.value })}
          className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1.5 focus:border-white/60 transition-colors"
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-sm">Published</p>
          <p className="text-white/40 text-xs mt-0.5">Respondents can fill the form</p>
        </div>
        <button
          onClick={async () => {
            const next = !published
            setPublished(next)
            await updateForm(form.id, { published: next })
          }}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            published ? 'bg-white' : 'bg-white/20'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
              published ? 'left-6 bg-black' : 'left-1 bg-white/60'
            }`}
          />
        </button>
      </div>

      {published && (
        <div>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Shareable link</p>
          <a
            href={`${origin}/forms/${form.id}`}
            target="_blank"
            rel="noreferrer"
            className="text-white/60 text-sm hover:text-white transition-colors break-all underline underline-offset-2"
          >
            {origin}/forms/{form.id}
          </a>
        </div>
      )}
    </div>
  )
}
