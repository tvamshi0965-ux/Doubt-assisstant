'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

const ADMIN_EMAILS = new Set(['tvamshi@gmail.com', 'tvamshi2007@gmail.com'])

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
    VALUES (${crypto.randomUUID()}, ${userId}, ${admin.email})
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

export async function createCourse(formData: FormData) {
  const admin = await requireAdmin()
  const title = String(formData.get('title') ?? '').trim()
  const subtitle = String(formData.get('subtitle') ?? '').trim()
  const color = String(formData.get('color') ?? 'violet')
  const icon = String(formData.get('icon') ?? 'ED').trim().slice(0, 3)
  if (!title || !subtitle || !icon) throw new Error('Enter a course title, description, and shortcut.')
  await db.execute(sql`
    INSERT INTO "course" ("id", "title", "subtitle", "color", "icon", "createdBy")
    VALUES (${crypto.randomUUID()}, ${title}, ${subtitle}, ${color}, ${icon}, ${admin.id})
  `)
  revalidatePath('/')
}

export async function deleteCourse(courseTitle: string) {
  await requireAdmin()
  if (!courseTitle.trim()) throw new Error('Course title is required.')
  await db.execute(sql`DELETE FROM "course_video" WHERE "courseTitle" = ${courseTitle}`)
  await db.execute(sql`DELETE FROM "course" WHERE "title" = ${courseTitle}`)
  revalidatePath('/')
}

export async function getAdminCourses() {
  await requireAdmin()
  return getPublicCourses()
}

export async function getPublicCourses() {
  const result = await db.execute(sql`SELECT DISTINCT ON ("title") "id", "title", "subtitle", "color", "icon", "notesPathname" FROM "course" ORDER BY "title", "createdAt" DESC`)
  const notes = await db.execute(sql`SELECT "id", "courseTitle", "title", "pathname" FROM "course_note" ORDER BY "createdAt" DESC`)
  return result.rows.map((course) => ({ ...course, notes: notes.rows.filter((note) => note.courseTitle === course.title) })) as Array<{ id: string; title: string; subtitle: string; color: string; icon: string; notesPathname: string | null; notes: Array<{ id: string; courseTitle: string; title: string; pathname: string }> }>
}

export async function addCourseVideo(formData: FormData) {
  const admin = await requireAdmin()
  const courseTitle = String(formData.get('courseTitle') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim()
  const position = Number(formData.get('position') ?? 0)
  const part = Number(formData.get('part') ?? 1)

  if (!courseTitle || !title || !youtubeUrl || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(youtubeUrl)) {
    throw new Error('Enter a course, lesson title, and valid YouTube URL.')
  }

  await db.execute(sql`
    INSERT INTO "course_video" ("id", "courseTitle", "title", "youtubeUrl", "position", "part", "createdBy")
    VALUES (${crypto.randomUUID()}, ${courseTitle}, ${title}, ${youtubeUrl}, ${Number.isFinite(position) ? position : 0}, ${Number.isFinite(part) && part > 0 ? part : 1}, ${admin.id})
  `)
  revalidatePath('/')
}

export async function updateCourseVideo(formData: FormData) {
  const admin = await requireAdmin()
  const id = String(formData.get('id') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const youtubeUrl = String(formData.get('youtubeUrl') ?? '').trim()
  const position = Number(formData.get('position') ?? 0)
  const part = Number(formData.get('part') ?? 1)
  if (!id || !title || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(youtubeUrl)) throw new Error('Enter a lesson title and valid YouTube URL.')
  await db.execute(sql`UPDATE "course_video" SET "title" = ${title}, "youtubeUrl" = ${youtubeUrl}, "position" = ${Number.isFinite(position) ? position : 0}, "part" = ${Number.isFinite(part) && part > 0 ? part : 1}, "updatedAt" = now(), "createdBy" = ${admin.id} WHERE "id" = ${id}`)
  revalidatePath('/')
}

export async function deleteCourseVideo(id: string) {
  await requireAdmin()
  if (!id.trim()) throw new Error('Lesson id is required.')
  await db.execute(sql`DELETE FROM "course_video" WHERE "id" = ${id}`)
  revalidatePath('/')
}

export async function getCourseVideos(courseTitle: string) {
  const result = await db.execute(sql`
    SELECT "id", "courseTitle", "title", "youtubeUrl", "position", "part"
    FROM "course_video"
    WHERE "courseTitle" = ${courseTitle}
    ORDER BY "position" ASC, "createdAt" ASC
  `)
  return result.rows as Array<{ id: string; courseTitle: string; title: string; youtubeUrl: string; position: number; part: number }>
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

export async function getLoginAccounts() {
  await requireAdmin()
  const result = await db.execute(sql`
    SELECT u."id", u."name", u."email", u."createdAt",
      CASE WHEN sp."userId" IS NULL THEN 'Admin' ELSE 'Student' END AS "role"
    FROM "user" u
    LEFT JOIN "student_profile" sp ON sp."userId" = u."id"
    ORDER BY u."createdAt" DESC
  `)
  return result.rows as Array<{ id: string; name: string; email: string; createdAt: string; role: 'Admin' | 'Student' }>
}

