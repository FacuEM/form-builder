import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

interface Params {
  params: Promise<{ id: string }>
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const BUCKET = 'form-uploads'

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

function mimeMatchesPattern(mime: string, pattern: string): boolean {
  if (pattern === '*/*') return true
  if (pattern.endsWith('/*')) return mime.startsWith(pattern.slice(0, -1))
  return mime === pattern
}

function isAllowedByQuestion(mime: string, mediaTypes: string | null): boolean {
  const patterns = (mediaTypes ?? 'image/*,video/*').split(',').map((s) => s.trim())
  return patterns.some((p) => mimeMatchesPattern(mime, p))
}

// POST /api/forms/[id]/upload — public (no session required, form must be published)
export async function POST(request: Request, { params }: Params) {
  const { id: formId } = await params

  const form = await prisma.form.findUnique({ where: { id: formId } })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!form.published) return NextResponse.json({ error: 'Form not published' }, { status: 403 })

  const formData = await request.formData().catch(() => null)
  if (!formData) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const questionId = formData.get('questionId')
  const responseId = formData.get('responseId')
  const file = formData.get('file')

  if (typeof questionId !== 'string' || typeof responseId !== 'string') {
    return NextResponse.json({ error: 'Missing questionId or responseId' }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 })
  }

  const question = await prisma.question.findFirst({
    where: { id: questionId, formId },
    select: { mediaTypes: true },
  })
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

  if (!isAllowedByQuestion(file.type, question.mediaTypes)) {
    return NextResponse.json({ error: 'File type not allowed for this question' }, { status: 415 })
  }

  // Use service role key for storage uploads (bypasses RLS)
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${formId}/${responseId}/${questionId}.${ext}`

  const bytes = await file.arrayBuffer()
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: true,
  })

  if (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
