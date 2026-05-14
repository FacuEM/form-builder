'use client'

import { forwardRef, useState } from 'react'
import { COUNTRIES, POPULAR_COUNT, flag } from './countries'

interface Props {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export const CountryQuestion = forwardRef<HTMLInputElement, Props>(function CountryQuestion(
  { value, onChange, onKeyDown, disabled },
  ref,
) {
  const [search, setSearch] = useState('')

  const filtered = search === ''
    ? COUNTRIES
    : COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (filtered.length === 1 && !value) {
        onChange(filtered[0].name)
        setSearch('')
        e.preventDefault()
        return
      }
      onKeyDown(e)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-white/20 pb-2 focus-within:border-white/60 transition-colors duration-150">
        <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={ref}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          disabled={disabled}
          placeholder="Search country…"
          className="flex-1 bg-transparent text-white text-xl placeholder:text-white/30 outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="text-white/30 hover:text-white/60 transition-colors text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Country list */}
      <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <p className="text-white/40 text-sm px-4 py-3 text-center">No results</p>
        ) : (
          filtered.map((c, i) => (
            <div key={c.code}>
              {i === POPULAR_COUNT && search === '' && (
                <div className="border-t border-white/10 my-1" />
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => { onChange(c.name); setSearch('') }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all duration-150 ${
                  value === c.name
                    ? 'border-white bg-white/10 text-white'
                    : 'border-white/20 text-white/70 hover:border-white/50 hover:text-white'
                }`}
              >
                <span className="text-lg leading-none">{flag(c.code)}</span>
                <span className="flex-1 text-sm">{c.name}</span>
                {value === c.name && (
                  <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
})
