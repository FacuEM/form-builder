'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { FormSchema, type FormJson } from '@/lib/formSchema'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return user
}

// --- Form-level actions (keep revalidatePath — they redirect or affect dashboard) ---

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

export async function updateForm(formId: string, data: {
  title?: string
  published?: boolean
  closed?: boolean
  introEnabled?: boolean
  introTitle?: string
  introContent?: Record<string, unknown> | null
  welcomeEnabled?: boolean
  welcomeTitle?: string
  welcomeDescription?: string
  welcomeAlert?: string | null
  thankYouEnabled?: boolean
  thankYouTitle?: string
  thankYouMessage?: string
}) {
  const user = await getUser()
  const { introContent, ...rest } = data
  await prisma.form.update({
    where: { id: formId, creatorId: user.id },
    data: {
      ...rest,
      ...(introContent !== undefined
        ? { introContent: introContent === null ? Prisma.DbNull : (introContent as Prisma.InputJsonValue) }
        : {}),
    },
  })
  revalidatePath(`/dashboard/forms/${formId}/edit`)
}

// --- Question actions (no revalidatePath — BuilderShell manages local state) ---

export async function createQuestion(formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  const last = await prisma.question.findFirst({ where: { formId }, orderBy: { order: 'desc' } })
  return prisma.question.create({
    data: { formId, text: 'New question', type: 'TEXT', order: (last?.order ?? -1) + 1, required: false },
    include: { choices: true },
  })
}

export async function updateQuestion(
  questionId: string,
  formId: string,
  data: {
    text?: string
    description?: string
    required?: boolean
    scored?: boolean
    textInputType?: 'text' | 'email' | 'phone' | 'url' | null
    placeholder?: string | null
    allowOther?: boolean
    mediaTypes?: string | null
  }
) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.question.update({ where: { id: questionId }, data })
}

export async function updateQuestionType(questionId: string, formId: string, type: string, deleteChoices: boolean) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  if (deleteChoices) await prisma.choice.deleteMany({ where: { questionId } })
  await prisma.question.update({ where: { id: questionId }, data: { type: type as never } })
}

export async function deleteQuestion(questionId: string, formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.question.delete({ where: { id: questionId } })
}

export async function moveQuestion(questionId: string, formId: string, dir: 'up' | 'down') {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  const questions = await prisma.question.findMany({ where: { formId }, orderBy: { order: 'asc' } })
  const idx = questions.findIndex((q: { id: string }) => q.id === questionId)
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= questions.length) return
  const a = questions[idx]
  const b = questions[swapIdx]
  await prisma.$transaction([
    prisma.question.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.question.update({ where: { id: b.id }, data: { order: a.order } }),
  ])
}

// --- Choice actions (no revalidatePath) ---

export async function createChoice(questionId: string, formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  const last = await prisma.choice.findFirst({ where: { questionId }, orderBy: { order: 'desc' } })
  return prisma.choice.create({
    data: { questionId, label: 'Option', order: (last?.order ?? -1) + 1 },
  })
}

export async function updateChoice(choiceId: string, formId: string, data: { label?: string; weight?: number }) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.choice.update({ where: { id: choiceId }, data })
}

export async function deleteChoice(choiceId: string, formId: string) {
  const user = await getUser()
  await prisma.form.findFirstOrThrow({ where: { id: formId, creatorId: user.id } })
  await prisma.choice.delete({ where: { id: choiceId } })
}

// --- Import / export ---

export async function exportFormAsJson(formId: string): Promise<FormJson> {
  const user = await getUser()
  const form = await prisma.form.findFirstOrThrow({
    where: { id: formId, creatorId: user.id },
    include: {
      questions: {
        where: { type: { notIn: ['STATEMENT', 'WELCOME'] } },
        orderBy: { order: 'asc' },
        include: { choices: { orderBy: { order: 'asc' } } },
      },
    },
  })

  return {
    name: form.title,
    introduction: {
      enabled: form.introEnabled,
      title: form.introTitle,
      content: form.introContent ?? undefined,
    },
    welcome: {
      enabled: form.welcomeEnabled,
      title: form.welcomeTitle,
      description: form.welcomeDescription ?? undefined,
      alertText: form.welcomeAlert ?? undefined,
    },
    thankYou: {
      enabled: form.thankYouEnabled,
      title: form.thankYouTitle,
      message: form.thankYouMessage,
    },
    questions: form.questions.map((q) => ({
      type: q.type as FormJson['questions'][number]['type'],
      text: q.text,
      description: q.description ?? undefined,
      required: q.required,
      textInputType: (q.textInputType ?? undefined) as FormJson['questions'][number]['textInputType'],
      placeholder: q.placeholder ?? undefined,
      allowOther: q.allowOther || undefined,
      scored: q.scored || undefined,
      mediaTypes: q.mediaTypes ?? undefined,
      choices: q.choices.length > 0
        ? q.choices.map((c) => ({ label: c.label, weight: c.weight }))
        : undefined,
    })),
  }
}

export async function importFormFromJson(raw: unknown): Promise<string> {
  const user = await getUser()

  const parsed = FormSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '))
  }
  const json = parsed.data

  const form = await prisma.form.create({
    data: {
      title: json.name,
      creatorId: user.id,
      introEnabled: json.introduction?.enabled ?? false,
      introTitle: json.introduction?.title ?? 'Introduction',
      introContent: json.introduction?.content
        ? (json.introduction.content as Prisma.InputJsonValue)
        : Prisma.DbNull,
      welcomeEnabled: json.welcome?.enabled ?? true,
      welcomeTitle: json.welcome?.title ?? 'Welcome',
      welcomeDescription: json.welcome?.description ?? null,
      welcomeAlert: json.welcome?.alertText ?? null,
      thankYouEnabled: json.thankYou?.enabled ?? true,
      thankYouTitle: json.thankYou?.title ?? 'Thank you!',
      thankYouMessage: json.thankYou?.message ?? 'Your response has been recorded.',
    },
  })

  for (let i = 0; i < json.questions.length; i++) {
    const q = json.questions[i]
    const question = await prisma.question.create({
      data: {
        formId: form.id,
        order: i,
        text: q.text,
        description: q.description ?? null,
        type: q.type,
        required: q.required,
        scored: q.scored ?? false,
        textInputType: q.textInputType ?? null,
        placeholder: q.placeholder ?? null,
        allowOther: q.allowOther ?? false,
        mediaTypes: q.mediaTypes ?? null,
      },
    })

    if (q.choices?.length) {
      await prisma.choice.createMany({
        data: q.choices.map((c, j) => ({
          questionId: question.id,
          label: c.label,
          weight: c.weight,
          order: j,
        })),
      })
    }
  }

  revalidatePath('/dashboard')
  return form.id
}
