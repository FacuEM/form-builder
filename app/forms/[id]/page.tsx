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

  if (form.closed) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-white text-lg font-medium mb-2">This form is closed</p>
          <p className="text-white/40 text-sm">The form is no longer accepting responses.</p>
        </div>
      </div>
    )
  }

  return <FormPlayer form={form as unknown as Form} />
}
