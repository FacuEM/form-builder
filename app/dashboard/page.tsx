import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createForm } from '@/app/actions/form'
import { signOut } from '@/app/actions/auth'
import { FormsList } from '@/components/builder/FormsList'

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
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

        <FormsList forms={forms} />
      </div>
    </div>
  )
}
