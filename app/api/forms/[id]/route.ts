import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const form = await prisma.form.findFirst({
    where: { id, creatorId: user.id },
    include: { questions: { include: { choices: true }, orderBy: { order: 'asc' } } },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(form)
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await request.json()

  const form = await prisma.form.updateMany({
    where: { id, creatorId: user.id },
    data,
  })
  if (form.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const deleted = await prisma.form.deleteMany({ where: { id, creatorId: user.id } })
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ success: true })
}
