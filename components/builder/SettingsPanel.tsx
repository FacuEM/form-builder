'use client'

import { useState } from 'react'
import { updateForm } from '@/app/actions/form'
import type { Form } from '@/types'
import { IntroductionEditor } from './IntroductionEditor'

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
  const [introEnabled, setIntroEnabled] = useState(form.introEnabled)
  const [welcomeEnabled, setWelcomeEnabled] = useState(form.welcomeEnabled)
  const [thankYouEnabled, setThankYouEnabled] = useState(form.thankYouEnabled)
  const [published, setPublished] = useState(form.published)
  const [closed, setClosed] = useState(form.closed)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const initialText = {
    introTitle: form.introTitle ?? '',
    welcomeTitle: form.welcomeTitle ?? '',
    welcomeDescription: form.welcomeDescription ?? '',
    welcomeAlert: form.welcomeAlert ?? '',
    thankYouTitle: form.thankYouTitle ?? '',
    thankYouMessage: form.thankYouMessage ?? '',
  }
  const [textDraft, setTextDraft] = useState(initialText)
  const [savedText, setSavedText] = useState(initialText)
  const [saving, setSaving] = useState(false)

  const isDirty = (Object.keys(textDraft) as (keyof typeof textDraft)[]).some(
    (k) => textDraft[k] !== savedText[k]
  )

  function setField(key: keyof typeof textDraft) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setTextDraft((d) => ({ ...d, [key]: e.target.value }))
  }

  async function handleSaveText() {
    setSaving(true)
    await updateForm(form.id, {
      introTitle: textDraft.introTitle,
      welcomeTitle: textDraft.welcomeTitle,
      welcomeDescription: textDraft.welcomeDescription,
      welcomeAlert: textDraft.welcomeAlert.trim() || null,
      thankYouTitle: textDraft.thankYouTitle,
      thankYouMessage: textDraft.thankYouMessage,
    })
    setSavedText({ ...textDraft })
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Introduction page */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">Introduction page</p>
            <p className="text-white/40 text-xs mt-0.5">Shown before the welcome screen</p>
          </div>
          <Toggle
            enabled={introEnabled}
            onToggle={() => {
              const next = !introEnabled
              setIntroEnabled(next)
              updateForm(form.id, { introEnabled: next })
            }}
          />
        </div>

        {introEnabled && (
          <div className="flex flex-col gap-3 pl-3 border-l border-white/10">
            <div>
              <label htmlFor="intro-title" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Title</label>
              <input
                id="intro-title"
                value={textDraft.introTitle}
                onChange={setField('introTitle')}
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Content</label>
              <IntroductionEditor
                content={form.introContent}
                onBlur={(content) => updateForm(form.id, { introContent: content })}
              />
            </div>
          </div>
        )}
      </section>

      <div className="border-t border-white/10" />

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
                value={textDraft.welcomeTitle}
                onChange={setField('welcomeTitle')}
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
              />
            </div>
            <div>
              <label htmlFor="welcome-desc" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                id="welcome-desc"
                value={textDraft.welcomeDescription}
                onChange={setField('welcomeDescription')}
                rows={2}
                placeholder="Optional..."
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors resize-none text-sm placeholder:text-white/20"
              />
            </div>
            <div>
              <label htmlFor="welcome-alert" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Alert message</label>
              <textarea
                id="welcome-alert"
                value={textDraft.welcomeAlert}
                onChange={setField('welcomeAlert')}
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
                value={textDraft.thankYouTitle}
                onChange={setField('thankYouTitle')}
                className="w-full bg-transparent border-b border-white/20 text-white outline-none py-1 focus:border-white/60 transition-colors text-sm"
              />
            </div>
            <div>
              <label htmlFor="thankyou-desc" className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                id="thankyou-desc"
                value={textDraft.thankYouMessage}
                onChange={setField('thankYouMessage')}
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

      {/* Sticky save footer */}
      {isDirty && (
        <div className="sticky bottom-0 bg-[#080808] border-t border-white/10 py-3 -mx-6 sm:-mx-8 px-6 sm:px-8 mt-4">
          <button
            onClick={handleSaveText}
            disabled={saving}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg disabled:opacity-50 hover:bg-white/90 transition-colors"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  )
}
