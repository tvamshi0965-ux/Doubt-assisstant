import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await db.execute(sql`SELECT COALESCE("seconds", 0) AS "seconds" FROM "study_time" WHERE "userId" = ${user.id} AND "studyDate" = CURRENT_DATE LIMIT 1`)
  return NextResponse.json({ seconds: Number(result.rows[0]?.seconds ?? 0) })
}

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await request.json().catch(() => null)
  const seconds = Number(payload?.seconds)
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 120) return NextResponse.json({ error: 'Invalid study time.' }, { status: 400 })
  await db.execute(sql`INSERT INTO "study_time" ("id", "userId", "studyDate", "seconds") VALUES (${crypto.randomUUID()}, ${user.id}, CURRENT_DATE, ${Math.floor(seconds)}) ON CONFLICT ("userId", "studyDate") DO UPDATE SET "seconds" = "study_time"."seconds" + ${Math.floor(seconds)}, "updatedAt" = now()`)
  const result = await db.execute(sql`SELECT "seconds" FROM "study_time" WHERE "userId" = ${user.id} AND "studyDate" = CURRENT_DATE LIMIT 1`)
  return NextResponse.json({ seconds: Number(result.rows[0]?.seconds ?? 0) })
}
