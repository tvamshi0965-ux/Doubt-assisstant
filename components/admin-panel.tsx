'use client'

import { useState } from 'react'
import { addCourseVideo, createStudentAccount, getAdminStudents } from '@/app/actions/admin'
import { Check, RefreshCw, UserPlus } from 'lucide-react'

type Student = Awaited<ReturnType<typeof getAdminStudents>>[number]

export function AdminPanel({ email }: { email: string }) {
  const [students, setStudents] = useState<Student[]>([])
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

  if (email.toLowerCase() !== 'tvamshi@gmail.com') return null

  return <section className="mt-8 rounded-2xl border border-[#e5e2ff] bg-[#fbfaff] p-5 shadow-[0_3px_10px_rgba(34,35,65,0.03)] sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6657e8]">Administrator</p><h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">Student accounts</h2><p className="mt-1 text-sm text-[#77798b]">Create login credentials and review each student&apos;s learning performance.</p></div>
      <button type="button" onClick={loadStudents} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfddfa] bg-white px-3 py-2 text-xs font-bold text-[#6657e8] disabled:opacity-50"><RefreshCw className="size-3.5" /> Refresh roster</button>
    </div>
    <form action={submitVideo} className="mt-5 grid gap-3 rounded-xl border border-[#ecebf6] bg-white p-4 sm:grid-cols-4"><select name="courseTitle" required aria-label="Course" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]"><option value="">Select course</option><option>Artificial Intelligence</option><option>Deep Learning</option><option>Machine Learning</option><option>Full Stack Development</option><option>SQL</option></select><input name="title" required placeholder="Lesson title" aria-label="Lesson title" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><input name="youtubeUrl" required type="url" placeholder="YouTube URL" aria-label="YouTube URL" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><div className="flex gap-2"><input name="position" type="number" min="0" placeholder="#" aria-label="Lesson position" className="w-16 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><button type="submit" disabled={loading} className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#6657e8] px-3 text-xs font-bold text-white disabled:opacity-50">Add lesson</button></div></form>
    <form action={submit} className="mt-5 grid gap-3 rounded-xl border border-[#ecebf6] bg-white p-4 sm:grid-cols-3">
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

