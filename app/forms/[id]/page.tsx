import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { FormPlayer } from '@/components/respondent/FormPlayer'
import type { Form } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const form = await prisma.form.findUnique({ where: { id }, select: { title: true, published: true } })
  if (!form || !form.published) return {}
  return { title: form.title }
}

export default async function FormPage({ params }: Props) {
  const { id } = await params

  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      questions: {
        include: { choices: { orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!form || !form.published) notFound()

  return <FormPlayer form={form as unknown as Form} />
}
