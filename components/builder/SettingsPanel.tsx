'use client'

import { useState } from 'react'
import { updateForm } from '@/app/actions/form'
import type { Form } from '@/types'

interface Props {
  form: Form
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${enabled ? 'bg-white' : 'bg-white/20'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full transition-all ${enabled ? 'left-6 bg-black' : 'left-1 bg-white/60'}`} />
    </button>
  )
}

export function SettingsPanel({ form }: Props) {
  const [welcomeEnabled, setWelcomeEnabled] = useState(form.welcomeEnabled)
  const [thankYouEnabled, setThankYouEnabled] = useState(form.thankYouEnabled)
  const [published, setPublished] = useState(form.published)
  const [closed, setClosed] = useState(form.closed)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="flex flex-col gap-6">

      {/* Welcome page */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Welcome page</p>
            <p className="text-white/40 text-xs mt-0.5">Shown before the first question</p>
          </div>
          <Toggle
            enabled={welcomeEnabled}
            onToggle={() => {
              const next = !welcomeEnabled
              setWelcomeEnabled(next)
              updateForm(form.id, { welcomeEnabled: next })
            }}
          />
        </div>

        {welcomeEnabled && (
          <div className="flex flex-col gap-3 pl-3 border-l border-white/10">
            <div>
              <label htmlFor="welcome-title" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Title</label>
              <input
                id="welcome-title"
                defaultValue={form.welcomeTitle}
                onBlur={(e) => updateForm(form.id, { welcomeTitle: e.target.value })}
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
              />
            </div>
            <div>
              <label htmlFor="welcome-desc" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                id="welcome-desc"
                defaultValue={form.welcomeDescription ?? ''}
                onBlur={(e) => updateForm(form.id, { welcomeDescription: e.target.value })}
                rows={2}
                placeholder="Optional..."
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors resize-none text-sm placeholder:text-white/20"
              />
            </div>
            <div>
              <label htmlFor="welcome-alert" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Alert message</label>
              <textarea
                id="welcome-alert"
                defaultValue={form.welcomeAlert ?? ''}
                onBlur={(e) => {
                  const val = e.target.value.trim()
                  updateForm(form.id, { welcomeAlert: val ? val : null })
                }}
                rows={2}
                placeholder="e.g. This form takes ~3 minutes. Answers are anonymous."
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors resize-none text-sm placeholder:text-white/20"
              />
              <p className="text-white/30 text-[11px] mt-1">Shown as a highlighted callout on the welcome page. Leave empty to hide.</p>
            </div>
          </div>
        )}
      </section>

      <div className="border-t border-white/10" />

      {/* Thank you page */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Thank you page</p>
            <p className="text-white/40 text-xs mt-0.5">Shown after the last question</p>
          </div>
          <Toggle
            enabled={thankYouEnabled}
            onToggle={() => {
              const next = !thankYouEnabled
              setThankYouEnabled(next)
              updateForm(form.id, { thankYouEnabled: next })
            }}
          />
        </div>

        {thankYouEnabled && (
          <div className="flex flex-col gap-3 pl-3 border-l border-white/10">
            <div>
              <label htmlFor="thankyou-title" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Title</label>
              <input
                id="thankyou-title"
                defaultValue={form.thankYouTitle}
                onBlur={(e) => updateForm(form.id, { thankYouTitle: e.target.value })}
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
              />
            </div>
            <div>
              <label htmlFor="thankyou-desc" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                id="thankyou-desc"
                defaultValue={form.thankYouMessage}
                onBlur={(e) => updateForm(form.id, { thankYouMessage: e.target.value })}
                rows={2}
                placeholder="Optional..."
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors resize-none text-sm placeholder:text-white/20"
              />
            </div>
          </div>
        )}
      </section>

      <div className="border-t border-white/10" />

      {/* Publishing */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Published</p>
            <p className="text-white/40 text-xs mt-0.5">Respondents can fill the form</p>
          </div>
          <Toggle
            enabled={published}
            onToggle={() => {
              const next = !published
              setPublished(next)
              updateForm(form.id, { published: next })
            }}
          />
        </div>

        {published && (
          <div className="flex flex-col gap-3 pl-3 border-l border-white/10">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1.5">Shareable link</p>
              <a
                href={`${origin}/forms/${form.id}`}
                target="_blank"
                rel="noreferrer"
                className="text-white/60 text-sm hover:text-white transition-colors break-all underline underline-offset-2"
              >
                {origin}/forms/{form.id}
              </a>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Accepting responses</p>
                <p className="text-white/40 text-xs mt-0.5">Turn off to stop new submissions</p>
              </div>
              <Toggle
                enabled={!closed}
                onToggle={() => {
                  const next = !closed
                  setClosed(next)
                  updateForm(form.id, { closed: next })
                }}
              />
            </div>
          </div>
        )}
      </section>

    </div>
  )
}
