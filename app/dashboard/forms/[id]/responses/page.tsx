import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { ResponsesShell } from '@/components/builder/ResponsesShell'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResponsesPage({ params }: Props) {
  const { id: formId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const form = await prisma.form.findFirst({
    where: { id: formId, creatorId: user.id },
  })
  if (!form) notFound()

  const [questions, responses] = await Promise.all([
    prisma.question.findMany({
      where: { formId },
      orderBy: { order: 'asc' },
      include: { choices: true },
    }),
    prisma.response.findMany({
      where: { formId },
      include: { answers: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <ResponsesShell
      form={form as never}
      questions={questions as never}
      responses={responses as never}
    />
  )
}
