import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || !file.type.startsWith('image/')) return NextResponse.json({ error: 'Choose an image file.' }, { status: 400 })
  const blob = await put(`profiles/${session.user.id}-${Date.now()}-${file.name}`, file, { access: 'public', contentType: file.type })
  await db.execute(sql`UPDATE "user" SET "image" = ${blob.url} WHERE "id" = ${session.user.id}`)
  return NextResponse.json({ image: blob.url })
}
