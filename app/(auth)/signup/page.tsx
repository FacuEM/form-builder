'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center flex flex-col gap-4">
          <p className="text-white text-xl font-light">Check your email to confirm your account.</p>
          <p className="text-white/40 text-sm">
            Click the link in the email, then{' '}
            <a href="/login" className="text-white/70 hover:text-white underline">
              sign in
            </a>
            .
          </p>
          <p className="text-white/25 text-xs">
            No email? Check spam, or disable email confirmation in Supabase Auth settings for local dev.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-2xl font-light mb-8">Create account</h1>
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
            minLength={6}
            className="bg-transparent border-b border-white/20 text-white placeholder:text-white/30 outline-none py-2 focus:border-white/60 transition-colors"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-3 bg-white text-black font-medium rounded-lg disabled:opacity-40 transition-opacity"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-white/40 text-sm">
          Have an account?{' '}
          <Link href="/login" className="text-white/70 hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
