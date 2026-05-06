'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

export async function deleteForm(formId: string) {
  const user = await getUser()
  await prisma.form.delete({ where: { id: formId, creatorId: user.id } })
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function createForm() {
  const user = await getUser()
  const form = await prisma.form.create({
    data: { title: 'Untitled form', creatorId: user.id },
  })
  revalidatePath('/dashboard')
  redirect(`/dashboard/forms/${form.id}/edit`)
}

export async function updateForm(formId: string, data: { title?: string; published?: boolean; thankYouMessage?: string }) {
  const user = await getUser()
  await prisma.form.update({
    where: { id: formId, creatorId: user.id },
    data,
  })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function createQuestion(formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  const last = await prisma.question.findFirst({
    where: { formId },
    orderBy: { order: 'desc' },
  })
  await prisma.question.create({
    data: { formId, text: 'New question', type: 'TEXT', order: (last?.order ?? -1) + 1 },
  })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function updateQuestion(questionId: string, formId: string, data: { text?: string; required?: boolean }) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.question.update({ where: { id: questionId }, data })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function updateQuestionType(questionId: string, formId: string, type: string, deleteChoices: boolean) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  if (deleteChoices) {
    await prisma.choice.deleteMany({ where: { questionId } })
  }
  await prisma.question.update({ where: { id: questionId }, data: { type: type as never } })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function deleteQuestion(questionId: string, formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.question.delete({ where: { id: questionId } })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function moveQuestion(questionId: string, formId: string, dir: 'up' | 'down') {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  const questions = await prisma.question.findMany({ where: { formId }, orderBy: { order: 'asc' } })
  const idx = questions.findIndex((q) => q.id === questionId)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= questions.length) return
  const a = questions[idx]
  const b = questions[swapIdx]
  await prisma.$transaction([
    prisma.question.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.question.update({ where: { id: b.id }, data: { order: a.order } }),
  ])
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function createChoice(questionId: string, formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  const last = await prisma.choice.findFirst({ where: { questionId }, orderBy: { order: 'desc' } })
  await prisma.choice.create({
    data: { questionId, label: 'Option', order: (last?.order ?? -1) + 1 },
  })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function updateChoice(choiceId: string, formId: string, label: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.choice.update({ where: { id: choiceId }, data: { label } })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

export async function deleteChoice(choiceId: string, formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.choice.delete({ where: { id: choiceId } })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}
