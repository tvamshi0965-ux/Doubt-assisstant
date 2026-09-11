'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAILS = new Set(['tvamshi@gmail.com'])

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  const email = session?.user?.email?.toLowerCase()
  if (!email || !ADMIN_EMAILS.has(email)) throw new Error('Unauthorized')
  return session.user
}

export async function createStudentAccount(formData: FormData) {
  await requireAdmin()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const name = String(formData.get('name') ?? '').trim()

  if (!email || !password || password.length < 8 || !name) {
    throw new Error('Enter a name, valid email, and password with at least 8 characters.')
  }

  const result = await auth.api.signUpEmail({
    body: { email, password, name },
    headers: await headers(),
  })

  const userId = result.user?.id
  if (!userId) throw new Error('Unable to create student account.')

  await db.execute(sql`
    INSERT INTO "student_profile" ("id", "userId", "createdBy")
    VALUES (${crypto.randomUUID()}, ${userId}, ${'tvamshi@gmail.com'})
    ON CONFLICT ("userId") DO NOTHING
  `)
  await db.execute(sql`
    INSERT INTO "student_performance" ("id", "userId")
    VALUES (${crypto.randomUUID()}, ${userId})
    ON CONFLICT ("userId") DO NOTHING
  `)

  revalidatePath('/')
  return { email }
}

export async function getAdminStudents() {
  await requireAdmin()
  const result = await db.execute(sql`
    SELECT u."id", u."name", u."email", p."createdAt", perf."streakDays", perf."studyMinutes", perf."xp", perf."courseProgress"
    FROM "student_profile" p
    INNER JOIN "user" u ON u."id" = p."userId"
    LEFT JOIN "student_performance" perf ON perf."userId" = p."userId"
    ORDER BY p."createdAt" DESC
  `)
  return result.rows as Array<{ id: string; name: string; email: string; createdAt: string; streakDays: number; studyMinutes: number; xp: number; courseProgress: number }>
}

