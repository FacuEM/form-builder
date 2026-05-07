'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-2xl font-light mb-8">Sign in</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-transparent border-b border-white/20 text-white placeholder:text-white/30 outline-none py-2 focus:border-white/60 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-transparent border-b border-white/20 text-white placeholder:text-white/30 outline-none py-2 focus:border-white/60 transition-colors"
          />
          <p className="text-red-400 text-sm min-h-[1.25rem]">{error}</p>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-3 bg-white text-black font-medium rounded-lg disabled:opacity-40 transition-opacity"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-white/40 text-sm">
          No account?{' '}
          <Link href="/signup" className="text-white/70 hover:text-white transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
