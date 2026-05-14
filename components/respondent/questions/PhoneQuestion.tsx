'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'

interface Country {
  code: string
  name: string
  dial: string
}

function flag(code: string): string {
  return code.toUpperCase().split('').map(c =>
    String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)
  ).join('')
}

// Popular countries first, then rest alphabetically
const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States',          dial: '+1'   },
  { code: 'GB', name: 'United Kingdom',          dial: '+44'  },
  { code: 'CA', name: 'Canada',                  dial: '+1'   },
  { code: 'AU', name: 'Australia',               dial: '+61'  },
  { code: 'DE', name: 'Germany',                 dial: '+49'  },
  { code: 'FR', name: 'France',                  dial: '+33'  },
  { code: 'ES', name: 'Spain',                   dial: '+34'  },
  { code: 'IT', name: 'Italy',                   dial: '+39'  },
  { code: 'BR', name: 'Brazil',                  dial: '+55'  },
  { code: 'MX', name: 'Mexico',                  dial: '+52'  },
  { code: 'IN', name: 'India',                   dial: '+91'  },
  { code: 'CN', name: 'China',                   dial: '+86'  },
  { code: 'JP', name: 'Japan',                   dial: '+81'  },
  { code: 'KR', name: 'South Korea',             dial: '+82'  },
  { code: 'AR', name: 'Argentina',               dial: '+54'  },
  // rest alphabetical
  { code: 'AF', name: 'Afghanistan',             dial: '+93'  },
  { code: 'AL', name: 'Albania',                 dial: '+355' },
  { code: 'DZ', name: 'Algeria',                 dial: '+213' },
  { code: 'AO', name: 'Angola',                  dial: '+244' },
  { code: 'AT', name: 'Austria',                 dial: '+43'  },
  { code: 'AZ', name: 'Azerbaijan',              dial: '+994' },
  { code: 'BD', name: 'Bangladesh',              dial: '+880' },
  { code: 'BE', name: 'Belgium',                 dial: '+32'  },
  { code: 'BO', name: 'Bolivia',                 dial: '+591' },
  { code: 'BA', name: 'Bosnia and Herzegovina',  dial: '+387' },
  { code: 'BG', name: 'Bulgaria',                dial: '+359' },
  { code: 'CM', name: 'Cameroon',                dial: '+237' },
  { code: 'CL', name: 'Chile',                   dial: '+56'  },
  { code: 'CO', name: 'Colombia',                dial: '+57'  },
  { code: 'CD', name: 'DR Congo',                dial: '+243' },
  { code: 'CR', name: 'Costa Rica',              dial: '+506' },
  { code: 'HR', name: 'Croatia',                 dial: '+385' },
  { code: 'CZ', name: 'Czech Republic',          dial: '+420' },
  { code: 'DK', name: 'Denmark',                 dial: '+45'  },
  { code: 'DO', name: 'Dominican Republic',      dial: '+1'   },
  { code: 'EC', name: 'Ecuador',                 dial: '+593' },
  { code: 'EG', name: 'Egypt',                   dial: '+20'  },
  { code: 'ET', name: 'Ethiopia',                dial: '+251' },
  { code: 'FI', name: 'Finland',                 dial: '+358' },
  { code: 'GH', name: 'Ghana',                   dial: '+233' },
  { code: 'GR', name: 'Greece',                  dial: '+30'  },
  { code: 'GT', name: 'Guatemala',               dial: '+502' },
  { code: 'HN', name: 'Honduras',                dial: '+504' },
  { code: 'HK', name: 'Hong Kong',               dial: '+852' },
  { code: 'HU', name: 'Hungary',                 dial: '+36'  },
  { code: 'ID', name: 'Indonesia',               dial: '+62'  },
  { code: 'IR', name: 'Iran',                    dial: '+98'  },
  { code: 'IQ', name: 'Iraq',                    dial: '+964' },
  { code: 'IE', name: 'Ireland',                 dial: '+353' },
  { code: 'IL', name: 'Israel',                  dial: '+972' },
  { code: 'JM', name: 'Jamaica',                 dial: '+1'   },
  { code: 'KZ', name: 'Kazakhstan',              dial: '+7'   },
  { code: 'KE', name: 'Kenya',                   dial: '+254' },
  { code: 'MA', name: 'Morocco',                 dial: '+212' },
  { code: 'MY', name: 'Malaysia',                dial: '+60'  },
  { code: 'NL', name: 'Netherlands',             dial: '+31'  },
  { code: 'NZ', name: 'New Zealand',             dial: '+64'  },
  { code: 'NG', name: 'Nigeria',                 dial: '+234' },
  { code: 'NO', name: 'Norway',                  dial: '+47'  },
  { code: 'PK', name: 'Pakistan',                dial: '+92'  },
  { code: 'PA', name: 'Panama',                  dial: '+507' },
  { code: 'PY', name: 'Paraguay',                dial: '+595' },
  { code: 'PE', name: 'Peru',                    dial: '+51'  },
  { code: 'PH', name: 'Philippines',             dial: '+63'  },
  { code: 'PL', name: 'Poland',                  dial: '+48'  },
  { code: 'PT', name: 'Portugal',                dial: '+351' },
  { code: 'RO', name: 'Romania',                 dial: '+40'  },
  { code: 'RU', name: 'Russia',                  dial: '+7'   },
  { code: 'SA', name: 'Saudi Arabia',            dial: '+966' },
  { code: 'SN', name: 'Senegal',                 dial: '+221' },
  { code: 'ZA', name: 'South Africa',            dial: '+27'  },
  { code: 'SE', name: 'Sweden',                  dial: '+46'  },
  { code: 'CH', name: 'Switzerland',             dial: '+41'  },
  { code: 'TW', name: 'Taiwan',                  dial: '+886' },
  { code: 'TZ', name: 'Tanzania',                dial: '+255' },
  { code: 'TH', name: 'Thailand',                dial: '+66'  },
  { code: 'TR', name: 'Turkey',                  dial: '+90'  },
  { code: 'UA', name: 'Ukraine',                 dial: '+380' },
  { code: 'AE', name: 'United Arab Emirates',    dial: '+971' },
  { code: 'UY', name: 'Uruguay',                 dial: '+598' },
  { code: 'UZ', name: 'Uzbekistan',              dial: '+998' },
  { code: 'VE', name: 'Venezuela',               dial: '+58'  },
  { code: 'VN', name: 'Vietnam',                 dial: '+84'  },
]

const POPULAR_COUNT = 15

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
