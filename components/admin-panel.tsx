'use client'

import { useState } from 'react'
import { addCourseVideo, createCourse, createStudentAccount, deleteCourse, getAdminCourses, getAdminStudents } from '@/app/actions/admin'
import { Check, RefreshCw, Trash2, UserPlus } from 'lucide-react'

type Student = Awaited<ReturnType<typeof getAdminStudents>>[number]

export function AdminPanel({ email, activeNav }: { email: string; activeNav: string }) {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Awaited<ReturnType<typeof getAdminCourses>>>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function loadStudents() {
    setLoading(true)
    setError('')
    try {
      setStudents(await getAdminStudents())
    } catch {
      setError('Only the administrator can view student data.')
    } finally {
      setLoading(false)
    }
  }

  async function submit(formData: FormData) {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const result = await createStudentAccount(formData)
      setMessage(`Student account created for ${result.email}.`)
      await loadStudents()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create student account.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCourses() {
    setLoading(true)
    try { setCourses(await getAdminCourses()) } catch { setError('Only the administrator can manage courses.') } finally { setLoading(false) }
  }

  async function submitCourse(formData: FormData) {
    setLoading(true); setMessage(''); setError('')
    try { await createCourse(formData); setMessage('Course added.'); await loadCourses() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to add course.') } finally { setLoading(false) }
  }

  async function removeCourse(title: string) {
    if (!window.confirm(`Delete ${title} and its lessons?`)) return
    setLoading(true); setMessage(''); setError('')
    try { await deleteCourse(title); setCourses((current) => current.filter((course) => course.title !== title)); setMessage('Course deleted.') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to delete course.') } finally { setLoading(false) }
  }

  async function submitVideo(formData: FormData) {
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await addCourseVideo(formData)
      setMessage('Lesson added to the course playlist.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to add lesson.')
    } finally {
      setLoading(false)
    }
  }

  if (!['tvamshi@gmail.com', 'tvamshi2007@gmail.com'].includes(email.toLowerCase()) || activeNav !== 'Home') return null

  return <section className="mt-6 w-full min-w-0 overflow-hidden rounded-2xl border border-[#e5e2ff] bg-[#fbfaff] p-3 shadow-[0_3px_10px_rgba(34,35,65,0.03)] sm:mt-8 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6657e8]">Administrator</p><h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">Student accounts</h2><p className="mt-1 text-sm text-[#77798b]">Create login credentials and review each student&apos;s learning performance.</p></div>
      <button type="button" onClick={loadStudents} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfddfa] bg-white px-3 py-2 text-xs font-bold text-[#6657e8] disabled:opacity-50"><RefreshCw className="size-3.5" /> Refresh roster</button>
    </div>
    <div className="mt-5 rounded-xl border border-[#ecebf6] bg-white p-3 sm:p-4"><div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-bold">Manage courses</h3><p className="mt-1 text-xs text-[#888998]">Add or remove courses from the catalog.</p></div><button type="button" onClick={loadCourses} disabled={loading} className="rounded-lg border border-[#dfddfa] px-3 py-2 text-xs font-bold text-[#6657e8]">Load courses</button></div><form action={submitCourse} className="mt-3 grid gap-2 sm:grid-cols-4"><input name="title" required placeholder="Course name" aria-label="Course name" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none" /><input name="subtitle" required placeholder="Description" aria-label="Course description" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none" /><input name="icon" required maxLength={3} placeholder="Icon" aria-label="Course icon" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none" /><div className="flex gap-2"><select name="color" aria-label="Course color" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-2 py-2.5 text-sm"><option value="violet">Violet</option><option value="teal">Teal</option><option value="amber">Amber</option></select><button type="submit" disabled={loading} className="rounded-lg bg-[#6657e8] px-3 text-xs font-bold text-white">Add</button></div></form>{courses.length > 0 && <div className="mt-3 grid gap-2">{courses.map((course) => <div key={course.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#efeff5] px-3 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-bold">{course.title}</p><p className="truncate text-[11px] text-[#999aa8]">{course.subtitle}</p></div><button type="button" onClick={() => removeCourse(course.title)} disabled={loading} className="shrink-0 rounded-lg p-2 text-[#c65d59] hover:bg-[#fff0ef]" aria-label={`Delete ${course.title}`}><Trash2 className="size-4" /></button></div>)}</div>}</div>
    <form action={submitVideo} className="mt-4 grid min-w-0 gap-2 rounded-xl border border-[#ecebf6] bg-white p-3 sm:mt-5 sm:gap-3 sm:p-4 sm:grid-cols-4"><select name="courseTitle" required aria-label="Course" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]"><option value="">Select course</option><option>Artificial Intelligence</option><option>Deep Learning</option><option>Machine Learning</option><option>Full Stack Development</option><option>SQL</option></select><input name="title" required placeholder="Lesson title" aria-label="Lesson title" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><input name="youtubeUrl" required type="url" placeholder="YouTube URL" aria-label="YouTube URL" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><div className="flex gap-2"><input name="position" type="number" min="0" placeholder="#" aria-label="Lesson position" className="w-16 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><button type="submit" disabled={loading} className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#6657e8] px-3 text-xs font-bold text-white disabled:opacity-50">Add lesson</button></div></form>
    <form action={submit} className="mt-4 grid min-w-0 gap-2 rounded-xl border border-[#ecebf6] bg-white p-3 sm:mt-5 sm:gap-3 sm:p-4 sm:grid-cols-3">
      <input name="name" required placeholder="Student name" aria-label="Student name" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" />
      <input name="email" required type="email" placeholder="Student email" aria-label="Student email" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" />
      <div className="flex gap-2"><input name="password" required minLength={8} type="password" placeholder="Password" aria-label="Student password" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><button type="submit" disabled={loading} aria-label="Create student account" className="inline-flex items-center justify-center rounded-lg bg-[#6657e8] px-3 text-white disabled:opacity-50"><UserPlus className="size-4" /></button></div>
    </form>
    {message && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#2e9e85]"><Check className="size-3.5" />{message}</p>}
    {error && <p className="mt-3 text-xs font-semibold text-[#c65d59]">{error}</p>}
    <div className="mt-5 grid gap-3">
      {students.length === 0 ? <p className="rounded-xl border border-dashed border-[#deddec] px-4 py-6 text-center text-xs text-[#999aa8]">Refresh the roster to load student login and performance data.</p> : students.map((student) => <div key={student.id} className="rounded-xl border border-[#ecebf6] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{student.name}</p><p className="mt-1 text-xs text-[#888998]">{student.email}</p></div><span className="rounded-full bg-[#f0efff] px-2 py-1 text-[10px] font-bold text-[#6657e8]">{student.courseProgress}% progress</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-[#fff8e7] p-2"><p className="text-sm font-bold">{student.streakDays}</p><p className="text-[10px] text-[#999aa8]">streak</p></div><div className="rounded-lg bg-[#f1f0ff] p-2"><p className="text-sm font-bold">{student.studyMinutes}m</p><p className="text-[10px] text-[#999aa8]">study time</p></div><div className="rounded-lg bg-[#eaf8f4] p-2"><p className="text-sm font-bold">{student.xp}</p><p className="text-[10px] text-[#999aa8]">XP</p></div></div></div>)}
    </div>
  </section>
}

