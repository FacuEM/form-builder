'use client'

import { useRef, useState } from 'react'
import type { Question } from '@/types'

interface Props {
  question: Question
  value: string
  onChange: (value: string) => void
  formId: string
  responseId: string
  disabled?: boolean
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

function acceptAttr(mediaTypes: string | null | undefined): string {
  const patterns = (mediaTypes ?? 'image/*,video/*').split(',').map((s) => s.trim())
  // Map wildcard patterns to concrete mime type lists for the file input accept attr
  const expanded: string[] = []
  for (const p of patterns) {
    if (p === 'image/*') expanded.push('image/jpeg', 'image/png', 'image/gif', 'image/webp')
    else if (p === 'video/*') expanded.push('video/mp4', 'video/webm', 'video/quicktime')
    else expanded.push(p)
  }
  return expanded.join(',')
}

export function MediaQuestion({ question, value, onChange, formId, responseId, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>(value ? 'done' : 'idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null)

  async function handleFile(file: File) {
    setUploadState('uploading')
    setErrorMsg(null)

    const fd = new FormData()
    fd.append('questionId', question.id)
    fd.append('responseId', responseId)
    fd.append('file', file)

    try {
      const res = await fetch(`/api/forms/${formId}/upload`, { method: 'POST', body: fd })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(error ?? 'Upload failed')
      }
      const { url } = await res.json()
      onChange(url)
      setUploadState('done')
      setPreview({ url, type: file.type.startsWith('image/') ? 'image' : 'video' })
    } catch (err) {
      setUploadState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const isImage = preview?.type === 'image' || (value && !value.includes('video'))

  return (
    <div className="flex flex-col gap-4">
      {uploadState === 'done' && value ? (
        <div className="rounded-lg overflow-hidden border border-white/20">
          {preview?.type === 'image' || (value && isImage) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Uploaded" className="max-h-64 w-full object-contain bg-black/20" />
          ) : (
            <video src={value} controls className="max-h-64 w-full" />
          )}
        </div>
      ) : null}

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
          disabled ? 'opacity-50 cursor-default' : 'hover:border-white/40'
        } ${
          uploadState === 'uploading' ? 'border-white/40' : 'border-white/20'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr(question.mediaTypes)}
          onChange={onInputChange}
          disabled={disabled || uploadState === 'uploading'}
          className="sr-only"
        />

        {uploadState === 'uploading' ? (
          <>
            <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Uploading…</p>
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/30">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-center">
              <p className="text-white/60 text-sm">
                {uploadState === 'done' ? 'Replace file' : 'Click or drag to upload'}
              </p>
              <p className="text-white/30 text-xs mt-1">Max 50 MB</p>
            </div>
          </>
        )}
      </div>

      {uploadState === 'error' && errorMsg && (
        <p className="text-red-400/80 text-sm">{errorMsg}</p>
      )}
    </div>
  )
}
