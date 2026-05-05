import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#080808] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-white text-2xl font-light">Your forms</h1>
          <form action="/api/forms" method="POST">
            <button
              type="submit"
              className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg"
            >
              + New form
            </button>
          </form>
        </div>
        <p className="text-white/30 text-sm">No forms yet. Create one to get started.</p>
      </div>
    </div>
  )
}
