import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { BuilderShell } from '@/components/builder/BuilderShell'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [form, responseCount] = await Promise.all([
    prisma.form.findFirst({
      where: { id, creatorId: user.id },
      include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } },
    }),
    prisma.response.count({ where: { formId: id } }),
  ])

  if (!form) notFound()

  return <BuilderShell form={form as never} hasResponses={responseCount > 0} />
}
