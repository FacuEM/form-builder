import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

// POST /api/forms/[id]/responses — public, no auth required
export async function POST(request: Request, { params }: Params) {
  const { id: formId } = await params

  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!form.published) return NextResponse.json({ error: 'Form not published' }, { status: 403 })

  const body = await request.json()
  const { respondentToken, responseId: existingResponseId, answers, completed } = body

  // Upsert Response
  let response
  if (existingResponseId) {
    response = await prisma.response.findUnique({ where: { id: existingResponseId } })
    if (!response) return NextResponse.json({ error: 'Response not found' }, { status: 404 })
  } else if (respondentToken) {
    response = await prisma.response.upsert({
      where: { respondentToken_formId: { respondentToken, formId } },
      create: { formId, respondentToken, completed: completed ?? false },
      update: { completed: completed ?? false },
    })
  } else {
    response = await prisma.response.create({
      data: { formId, completed: completed ?? false },
    })
  }

  // Upsert each Answer
  for (const { questionId, value } of answers ?? []) {
    await prisma.answer.upsert({
      where: { responseId_questionId: { responseId: response.id, questionId } },
      create: { responseId: response.id, questionId, value },
      update: { value },
    })
  }

  // Mark completed on final answer
  if (completed && !response.completed) {
    await prisma.response.update({ where: { id: response.id }, data: { completed: true } })
  }

  return NextResponse.json({ responseId: response.id })
}

// GET /api/forms/[id]/responses — protected, creator only
export async function GET(request: Request, { params }: Params) {
  const { id: formId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await prisma.form.findFirst({ where: { id: formId, creatorId: user.id } })
  if (!form) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const responses = await prisma.response.findMany({
    where: { formId },
    include: { answers: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(responses)
}
