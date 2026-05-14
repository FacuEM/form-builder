'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { COUNTRIES, POPULAR_COUNT, flag } from './countries'
import type { Country } from './countries'

function parseCountry(value: string): Country {
  if (!value) return COUNTRIES[0]
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
  return sorted.find(c => value.startsWith(c.dial)) ?? COUNTRIES[0]
}

function parseLocal(value: string, country: Country): string {
  if (!value) return ''
  if (value.startsWith(country.dial + ' ')) return value.slice(country.dial.length + 1)
  if (value.startsWith(country.dial)) return value.slice(country.dial.length)
  return value
}

interface Props {
  value: string
  onChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
}

export const PhoneQuestion = forwardRef<HTMLInputElement, Props>(function PhoneQuestion(
  { value, onChange, onKeyDown, disabled },
  ref,
) {
  const [country, setCountry] = useState<Country>(() => parseCountry(value))
  const [local, setLocal] = useState<string>(() => parseLocal(value, parseCountry(value)))
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 0)
  }, [isOpen])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectCountry(c: Country) {
    setCountry(c)
    setIsOpen(false)
    setSearch('')
    onChange(local ? c.dial + ' ' + local : '')
  }

  function handleLocalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setLocal(v)
    onChange(v ? country.dial + ' ' + v : '')
  }

  const filtered = COUNTRIES.filter(c =>
    search === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  )

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center border-b border-white/20 pb-2 focus-within:border-white/60 transition-colors duration-150">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(v => !v)}
          className="flex items-center gap-1.5 pr-3 mr-3 border-r border-white/20 shrink-0 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl leading-none">{flag(country.code)}</span>
          <span className="text-sm font-mono text-white/60">{country.dial}</span>
          <svg
            className={`w-3 h-3 text-white/30 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <input
          ref={ref}
          type="tel"
          inputMode="tel"
          value={local}
          onChange={handleLocalChange}
          onKeyDown={onKeyDown}
          disabled={disabled}
          placeholder="555 000 0000"
          className="flex-1 bg-transparent text-white text-xl placeholder:text-white/30 outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-72 bg-[#181818] border border-white/15 rounded-xl overflow-hidden shadow-2xl shadow-black/60">
          <div className="p-2 border-b border-white/10">
            <div className="flex items-center gap-2 px-2">
              <svg className="w-3.5 h-3.5 text-white/30 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setIsOpen(false); setSearch('') }
                  if (e.key === 'Enter' && filtered.length > 0) selectCountry(filtered[0])
                }}
                placeholder="Search country…"
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none py-1"
              />
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-white/40 text-sm text-center">No results</p>
            ) : (
              filtered.map((c, i) => (
                <div key={c.code}>
                  {i === POPULAR_COUNT && search === '' && (
                    <div className="border-t border-white/10 my-1" />
                  )}
                  <button
                    type="button"
                    onClick={() => selectCountry(c)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      c.code === country.code ? 'bg-white/8' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="text-base leading-none">{flag(c.code)}</span>
                    <span className="flex-1 text-white/80 text-sm truncate">{c.name}</span>
                    <span className="text-white/30 text-xs font-mono shrink-0">{c.dial}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
})
