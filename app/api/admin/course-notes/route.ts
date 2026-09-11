import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

const ADMIN_EMAILS = new Set(['tvamshi@gmail.com', 'tvamshi2007@gmail.com'])

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.email || !ADMIN_EMAILS.has(session.user.email.toLowerCase())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const courseTitle = String(formData.get('courseTitle') ?? '').trim()
  const file = formData.get('file')
  if (!courseTitle || !(file instanceof File) || file.type !== 'application/pdf') return NextResponse.json({ error: 'Choose a PDF and course.' }, { status: 400 })
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: 'PDF must be smaller than 20 MB.' }, { status: 400 })
  const blob = await put(`course-notes/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`, file, { access: 'private', addRandomSuffix: false })
  const courseMetadata: Record<string, { subtitle: string; color: string; icon: string }> = {
    'Artificial Intelligence': { subtitle: 'Build intuition for modern AI systems.', color: 'violet', icon: 'AI' },
    'Deep Learning': { subtitle: 'Understand neural networks from first principles.', color: 'teal', icon: 'DL' },
    'Machine Learning': { subtitle: 'Learn practical models and workflows.', color: 'amber', icon: 'ML' },
    'Full Stack Development': { subtitle: 'Create complete web applications.', color: 'violet', icon: 'FS' },
    SQL: { subtitle: 'Query and model data with confidence.', color: 'teal', icon: 'DB' },
  }
  const metadata = courseMetadata[courseTitle] ?? { subtitle: 'A new EDU TECH course.', color: 'violet', icon: 'ED' }
  await db.execute(sql`INSERT INTO "course" ("id", "title", "subtitle", "color", "icon", "createdBy", "notesPathname") VALUES (${crypto.randomUUID()}, ${courseTitle}, ${metadata.subtitle}, ${metadata.color}, ${metadata.icon}, ${session.user.id}, ${blob.pathname}) ON CONFLICT ("title") DO UPDATE SET "notesPathname" = ${blob.pathname}`)
  return NextResponse.json({ success: true })
}
