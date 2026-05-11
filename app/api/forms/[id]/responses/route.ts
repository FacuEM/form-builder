import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

const MAX_ANSWERS = 500
const MAX_VALUE_LEN = 10_000
const MAX_TOKEN_LEN = 200

// POST /api/forms/[id]/responses — public, no auth required
export async function POST(request: Request, { params }: Params) {
  const { id: formId } = await params

  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { questions: { select: { id: true } } },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!form.published) return NextResponse.json({ error: 'Form not published' }, { status: 403 })
  if (form.closed) return NextResponse.json({ error: 'Form is closed' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { respondentToken, responseId: existingResponseId, answers, completed } = body as {
    respondentToken?: unknown
    responseId?: unknown
    answers?: unknown
    completed?: unknown
  }

  if (respondentToken !== undefined && (typeof respondentToken !== 'string' || respondentToken.length > MAX_TOKEN_LEN)) {
    return NextResponse.json({ error: 'Invalid respondentToken' }, { status: 400 })
  }
  if (existingResponseId !== undefined && typeof existingResponseId !== 'string') {
    return NextResponse.json({ error: 'Invalid responseId' }, { status: 400 })
  }
  if (answers !== undefined && !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 })
  }
  if (Array.isArray(answers) && answers.length > MAX_ANSWERS) {
    return NextResponse.json({ error: 'Too many answers' }, { status: 400 })
  }
  const isCompleted = completed === true

  const validQuestionIds = new Set(form.questions.map((q) => q.id))

  // Upsert Response — scoped to this form to prevent IDOR.
  let response
  if (existingResponseId) {
    response = await prisma.response.findFirst({
      where: { id: existingResponseId, formId },
    })
    if (!response) return NextResponse.json({ error: 'Response not found' }, { status: 404 })
  } else if (respondentToken) {
    response = await prisma.response.upsert({
      where: { respondentToken_formId: { respondentToken: respondentToken as string, formId } },
      create: { formId, respondentToken: respondentToken as string, completed: isCompleted },
      update: { completed: isCompleted },
    })
  } else {
    response = await prisma.response.create({
      data: { formId, completed: isCompleted },
    })
  }

  // Upsert each Answer — questionId must belong to this form.
  for (const entry of (answers as unknown[]) ?? []) {
    if (!entry || typeof entry !== 'object') continue
    const { questionId, value } = entry as { questionId?: unknown; value?: unknown }
    if (typeof questionId !== 'string' || !validQuestionIds.has(questionId)) continue
    if (typeof value !== 'string' || value.length > MAX_VALUE_LEN) continue

    await prisma.answer.upsert({
      where: { responseId_questionId: { responseId: response.id, questionId } },
      create: { responseId: response.id, questionId, value },
      update: { value },
    })
  }

  // Mark completed on final answer
  if (isCompleted && !response.completed) {
    await prisma.response.update({ where: { id: response.id }, data: { completed: true } })
  }

  return NextResponse.json({ responseId: response.id })
}

// GET /api/forms/[id]/responses — protected, creator only
export async function GET(_request: Request, { params }: Params) {
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
