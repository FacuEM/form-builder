import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const forms = await prisma.form.findMany({
    where: { creatorId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { responses: true, questions: true } } },
  })

  return NextResponse.json(forms)
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await request.json().catch(() => ({ title: 'Untitled form' }))

  const form = await prisma.form.create({
    data: { title: title ?? 'Untitled form', creatorId: user.id },
  })

  return NextResponse.json(form, { status: 201 })
}
