import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { createQuestion } from '@/app/actions/form'
import { BuilderShell } from '@/components/builder/BuilderShell'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const form = await prisma.form.findFirst({
    where: { id, creatorId: user.id },
    include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } },
  })

  if (!form) notFound()

  const hasResponses = await prisma.response.count({ where: { formId: id } })

  return <BuilderShell form={form as never} hasResponses={hasResponses > 0} createQuestion={createQuestion.bind(null, id)} />
}
