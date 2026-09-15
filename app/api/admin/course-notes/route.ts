import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

const ADMIN_EMAILS = new Set(['tvamshi@gmail.com', 'tvamshi2007@gmail.com'])

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.email || !ADMIN_EMAILS.has(session.user.email.toLowerCase())) throw new Error('Unauthorized')
  return session
}

export async function GET() {
  try {
    await requireAdmin()
    const result = await db.execute(sql`SELECT "id", "courseTitle", "title", "pathname" FROM "course_note" ORDER BY "createdAt" DESC`)
    return NextResponse.json(result.rows)
  } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const { id, title } = await request.json()
    if (!id || !String(title).trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
    await db.execute(sql`UPDATE "course_note" SET "title" = ${String(title).trim()} WHERE "id" = ${id}`)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Unable to update PDF title.' }, { status: 400 }) }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin()
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'PDF id is required.' }, { status: 400 })
    await db.execute(sql`DELETE FROM "course_note" WHERE "id" = ${id}`)
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Unable to delete PDF.' }, { status: 400 }) }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.email || !ADMIN_EMAILS.has(session.user.email.toLowerCase())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const courseTitle = String(formData.get('courseTitle') ?? '').trim()
  const file = formData.get('file')
  const isPdf = file instanceof File && (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
  if (!courseTitle || !isPdf) return NextResponse.json({ error: 'Choose a course and a valid .pdf file.' }, { status: 400 })
  const blob = await put(`course-notes/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`, file, { access: 'public', addRandomSuffix: false })
  const courseMetadata: Record<string, { subtitle: string; color: string; icon: string }> = {
    'Artificial Intelligence': { subtitle: 'Build intuition for modern AI systems.', color: 'violet', icon: 'AI' },
    'Deep Learning': { subtitle: 'Understand neural networks from first principles.', color: 'teal', icon: 'DL' },
    'Machine Learning': { subtitle: 'Learn practical models and workflows.', color: 'amber', icon: 'ML' },
    'Full Stack Development': { subtitle: 'Create complete web applications.', color: 'violet', icon: 'FS' },
    SQL: { subtitle: 'Query and model data with confidence.', color: 'teal', icon: 'DB' },
  }
  const metadata = courseMetadata[courseTitle] ?? { subtitle: 'A new EDU TECH course.', color: 'violet', icon: 'ED' }
  await db.execute(sql`INSERT INTO "course_note" ("id", "courseTitle", "title", "pathname", "createdBy") VALUES (${crypto.randomUUID()}, ${courseTitle}, ${file.name}, ${blob.url}, ${session.user.id})`)
  const existing = await db.execute(sql`SELECT "id" FROM "course" WHERE "title" = ${courseTitle} LIMIT 1`)
  if (existing.rows.length === 0) {
    await db.execute(sql`INSERT INTO "course" ("id", "title", "subtitle", "color", "icon", "createdBy", "notesPathname") VALUES (${crypto.randomUUID()}, ${courseTitle}, ${metadata.subtitle}, ${metadata.color}, ${metadata.icon}, ${session.user.id}, ${blob.url})`)
  }
  return NextResponse.json({ success: true, notesUrl: blob.url })
}
