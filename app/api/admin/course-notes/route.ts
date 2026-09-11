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
  await db.execute(sql`UPDATE "course" SET "notesPathname" = ${blob.pathname} WHERE "title" = ${courseTitle}`)
  return NextResponse.json({ success: true })
}
