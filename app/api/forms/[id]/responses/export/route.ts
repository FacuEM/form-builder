import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

function csvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatValue(value: string): string {
  if (value.startsWith('__other__: ')) return `Other: ${value.slice('__other__: '.length)}`
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return parsed.map((v: string) =>
        v.startsWith('__other__: ') ? `Other: ${v.slice('__other__: '.length)}` : v
      ).join('; ')
    }
  } catch {}
  return value
}

export async function GET(_request: Request, { params }: Params) {
  const { id: formId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await prisma.form.findFirst({
    where: { id: formId, creatorId: user.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { choices: { orderBy: { order: 'asc' } } },
      },
    },
  })
  if (!form) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const responses = await prisma.response.findMany({
    where: { formId },
    include: { answers: true },
    orderBy: { createdAt: 'desc' },
  })

  const displayQuestions = form.questions.filter(
    (q) => q.type !== 'STATEMENT' && q.type !== 'WELCOME'
  )
  const scoredQuestions = displayQuestions.filter(
    (q) => q.scored && (q.type === 'CHOICE' || q.type === 'DROPDOWN')
  )
  const hasScored = scoredQuestions.length > 0

  const headerCols: string[] = ['Submitted At', 'Status']
  if (hasScored) headerCols.push('Score')
  for (const q of displayQuestions) headerCols.push(q.text)

  const rows: string[] = [headerCols.map(csvCell).join(',')]

  for (const response of responses) {
    const answerMap = Object.fromEntries(response.answers.map((a) => [a.questionId, a.value]))

    let score = 0
    if (hasScored) {
      for (const q of scoredQuestions) {
        const answerValue = answerMap[q.id]
        if (!answerValue) continue
        const choice = q.choices.find((c) => c.label === answerValue)
        if (choice) score += choice.weight
      }
    }

    const cols: string[] = [
      response.createdAt.toISOString(),
      response.completed ? 'Complete' : 'Partial',
    ]
    if (hasScored) cols.push(String(score))
    for (const q of displayQuestions) {
      const raw = answerMap[q.id] ?? ''
      cols.push(raw ? formatValue(raw) : '')
    }

    rows.push(cols.map(csvCell).join(','))
  }

  const csv = rows.join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="responses-${formId}.csv"`,
    },
  })
}
