import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}

function istDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

export async function POST() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const today = istDate()
  await db.execute(sql`INSERT INTO "app_activity" ("id", "userId", "activityDate") VALUES (${crypto.randomUUID()}, ${user.id}, ${today}) ON CONFLICT ("userId", "activityDate") DO NOTHING`)
  return GET()
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const result = await db.execute(sql`SELECT "activityDate" FROM "app_activity" WHERE "userId" = ${user.id} ORDER BY "activityDate" DESC LIMIT 400`)
  const dates = result.rows.map((row) => String(row.activityDate).slice(0, 10))
  const today = istDate()
  const dateValue = (date: string) => Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)))
  const todayValue = dateValue(today)
  let streak = 0
  for (let index = 0; index < dates.length; index += 1) {
    if (todayValue - dateValue(dates[index]) !== index * 86400000) break
    streak += 1
  }
  return NextResponse.json({ streak, activeToday: dates[0] === today })
}
