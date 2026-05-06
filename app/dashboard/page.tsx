import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createForm } from '@/app/actions/form'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const forms = await prisma.form.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { responses: true } } },
  })

  return (
    <div className="min-h-screen bg-[#080808] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-white text-2xl font-light">Your forms</h1>
          <div className="flex items-center gap-3">
            <form action={createForm}>
              <button
                type="submit"
                className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                + New form
              </button>
            </form>
            <form action={signOut}>
              <button
                type="submit"
                className="px-4 py-2.5 text-white/40 hover:text-white text-sm transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {forms.length === 0 ? (
          <p className="text-white/30 text-sm">No forms yet. Create one to get started.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {forms.map((form) => (
              <Link
                key={form.id}
                href={`/dashboard/forms/${form.id}/edit`}
                className="flex items-center justify-between px-4 py-4 rounded-xl border border-white/10 hover:border-white/25 hover:bg-white/3 transition-all group"
              >
                <div>
                  <p className="text-white text-sm font-medium">{form.title}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {form._count.responses} response{form._count.responses !== 1 ? 's' : ''} ·{' '}
                    {form.published ? (
                      <span className="text-green-400/60">Published</span>
                    ) : (
                      <span>Draft</span>
                    )}
                  </p>
                </div>
                <span className="text-white/20 group-hover:text-white/50 transition-colors">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
