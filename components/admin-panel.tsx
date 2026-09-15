'use client'

import { useEffect, useState } from 'react'
import { addCourseVideo, createCourse, createStudentAccount, deleteCourse, deleteCourseVideo, getAdminCourses, getAdminStudents, getCourseVideos, getLoginAccounts, updateCourseVideo } from '@/app/actions/admin'
import { Check, Pencil, RefreshCw, Trash2, UserPlus } from 'lucide-react'

type Student = Awaited<ReturnType<typeof getAdminStudents>>[number]

export function AdminPanel({ email, activeNav }: { email: string; activeNav: string }) {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Awaited<ReturnType<typeof getAdminCourses>>>([])
  const [accounts, setAccounts] = useState<Awaited<ReturnType<typeof getLoginAccounts>>>([])
  const [videos, setVideos] = useState<Awaited<ReturnType<typeof getCourseVideos>>>([])
  const [notes, setNotes] = useState<Array<{ id: string; courseTitle: string; title: string; pathname: string }>>([])
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [videoCourse, setVideoCourse] = useState('')
  const [editingVideo, setEditingVideo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [adminSection, setAdminSection] = useState<'students' | 'courses' | 'pdfs' | 'lessons' | 'accounts'>('students')

  useEffect(() => {
    if (activeNav === 'Administrator' && ['tvamshi@gmail.com', 'tvamshi2007@gmail.com'].includes(email.toLowerCase())) {
      void loadCourses()
    }
  }, [activeNav, email])

  async function loadAccounts() {
    setLoading(true)
    setError('')
    try { setAccounts(await getLoginAccounts()) } catch { setError('Only the administrator can view login accounts.') } finally { setLoading(false) }
  }

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

  async function readJsonResponse(response: Response) {
    const text = await response.text()
    try { return JSON.parse(text) } catch { throw new Error(response.status === 413 ? 'PDF is too large. Please upload a smaller PDF.' : text.slice(0, 160) || 'The server returned an invalid response.') }
  }

  async function loadNotes() {
    try { const response = await fetch('/api/admin/course-notes'); const result = await readJsonResponse(response); if (!response.ok) throw new Error(result.error); setNotes(result) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load PDFs.') }
  }

  async function updateNote(id: string, title: string) {
    const response = await fetch('/api/admin/course-notes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, title }) })
    if (!response.ok) throw new Error('Unable to update PDF title.')
    setNotes((current) => current.map((note) => note.id === id ? { ...note, title } : note)); setEditingNote(null)
  }

  async function deleteNote(id: string) {
    if (!window.confirm('Delete this PDF?')) return
    const response = await fetch(`/api/admin/course-notes?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Unable to delete PDF.')
    setNotes((current) => current.filter((note) => note.id !== id))
  }

  async function uploadNotes(formData: FormData) {
    setLoading(true); setMessage(''); setError('')
    try {
      const file = formData.get('file')
      if (!(file instanceof File) || file.size === 0) throw new Error('Choose a PDF file before uploading.')
      if (file.size > 20 * 1024 * 1024) throw new Error('PDF must be smaller than 20 MB.')
      const response = await fetch('/api/admin/course-notes', { method: 'POST', body: formData })
      const result = await readJsonResponse(response)
      if (!response.ok) throw new Error(result.error ?? 'Unable to upload notes.')
      setMessage('Course notes uploaded.'); await loadCourses(); await loadNotes()
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to upload notes.') } finally { setLoading(false) }
  }

  async function removeCourse(title: string) {
    if (!window.confirm(`Delete ${title} and its lessons?`)) return
    setLoading(true); setMessage(''); setError('')
    try { await deleteCourse(title); setCourses((current) => current.filter((course) => course.title !== title)); setMessage('Course deleted.') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to delete course.') } finally { setLoading(false) }
  }

  async function loadVideos(courseTitle = videoCourse) {
    if (!courseTitle) return
    setVideoCourse(courseTitle)
    setLoading(true)
    try { setVideos(await getCourseVideos(courseTitle)) } catch { setError('Unable to load course lessons.') } finally { setLoading(false) }
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

  async function saveVideo(formData: FormData) {
    setLoading(true); setMessage(''); setError('')
    try { await updateCourseVideo(formData); setMessage('Lesson updated.'); setEditingVideo(null); await loadVideos() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to update lesson.') } finally { setLoading(false) }
  }

  async function removeVideo(id: string) {
    if (!window.confirm('Delete this lesson?')) return
    setLoading(true); setMessage(''); setError('')
    try { await deleteCourseVideo(id); setVideos((current) => current.filter((video) => video.id !== id)); setMessage('Lesson deleted.') } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to delete lesson.') } finally { setLoading(false) }
  }

  if (!['tvamshi@gmail.com', 'tvamshi2007@gmail.com'].includes(email.toLowerCase()) || activeNav !== 'Administrator') return null

  return <section className="mt-6 w-full min-w-0 overflow-hidden rounded-2xl border border-[#e5e2ff] bg-[#fbfaff] p-3 shadow-[0_3px_10px_rgba(34,35,65,0.03)] sm:mt-8 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6657e8]">Administrator</p><h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">Student accounts</h2><p className="mt-1 text-sm text-[#77798b]">Create login credentials and review each student&apos;s learning performance.</p></div>
      <button type="button" onClick={loadStudents} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfddfa] bg-white px-3 py-2 text-xs font-bold text-[#6657e8] disabled:opacity-50"><RefreshCw className="size-3.5" /> Refresh roster</button>
    </div>
    <nav aria-label="Administrator sections" className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-[#ecebf6] bg-white p-2 sm:grid-cols-5"><button type="button" onClick={() => setAdminSection('students')} className={`rounded-lg px-2 py-2 text-xs font-bold ${adminSection === 'students' ? 'bg-[#6657e8] text-white' : 'text-[#77798b] hover:bg-[#f5f3ff]'}`}>Students</button><button type="button" onClick={() => setAdminSection('courses')} className={`rounded-lg px-2 py-2 text-xs font-bold ${adminSection === 'courses' ? 'bg-[#6657e8] text-white' : 'text-[#77798b] hover:bg-[#f5f3ff]'}`}>Courses</button><button type="button" onClick={() => setAdminSection('pdfs')} className={`rounded-lg px-2 py-2 text-xs font-bold ${adminSection === 'pdfs' ? 'bg-[#6657e8] text-white' : 'text-[#77798b] hover:bg-[#f5f3ff]'}`}>PDF notes</button><button type="button" onClick={() => setAdminSection('lessons')} className={`rounded-lg px-2 py-2 text-xs font-bold ${adminSection === 'lessons' ? 'bg-[#6657e8] text-white' : 'text-[#77798b] hover:bg-[#f5f3ff]'}`}>Lessons</button><button type="button" onClick={() => setAdminSection('accounts')} className={`rounded-lg px-2 py-2 text-xs font-bold ${adminSection === 'accounts' ? 'bg-[#6657e8] text-white' : 'text-[#77798b] hover:bg-[#f5f3ff]'}`}>Accounts</button></nav>
    <div className={`${adminSection === 'courses' ? '' : 'hidden'} mt-5 rounded-xl border border-[#ecebf6] bg-white p-3 sm:p-4`}><div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-bold">Manage courses</h3><p className="mt-1 text-xs text-[#888998]">Add or remove courses from the catalog.</p></div><button type="button" onClick={loadCourses} disabled={loading} className="rounded-lg border border-[#dfddfa] px-3 py-2 text-xs font-bold text-[#6657e8]">Load courses</button></div><form action={submitCourse} className="mt-3 grid gap-2 sm:grid-cols-4"><input name="title" required placeholder="Course name" aria-label="Course name" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none" /><input name="subtitle" required placeholder="Description" aria-label="Course description" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none" /><input name="icon" required maxLength={3} placeholder="Icon" aria-label="Course icon" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none" /><div className="flex gap-2"><select name="color" aria-label="Course color" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-2 py-2.5 text-sm"><option value="violet">Violet</option><option value="teal">Teal</option><option value="amber">Amber</option></select><button type="submit" disabled={loading} className="rounded-lg bg-[#6657e8] px-3 text-xs font-bold text-white">Add</button></div></form><form action={uploadNotes} className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-[#deddec] p-3 sm:flex-row sm:items-center"><select name="courseTitle" required aria-label="Notes course" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm"><option value="">Attach PDF notes to course</option>{[{ id: 'ai', title: 'Artificial Intelligence', icon: 'AI' }, { id: 'dl', title: 'Deep Learning', icon: 'DL' }, { id: 'ml', title: 'Machine Learning', icon: 'ML' }, { id: 'fs', title: 'Full Stack Development', icon: 'FS' }, { id: 'sql', title: 'SQL', icon: 'DB' }, ...courses.filter((course) => !['Artificial Intelligence', 'Deep Learning', 'Machine Learning', 'Full Stack Development', 'SQL'].includes(course.title))].map((course) => <option key={course.id} value={course.title}>{course.icon} {course.title}</option>)}</select><input name="file" required type="file" accept="application/pdf" aria-label="Course PDF notes" className="min-w-0 flex-1 text-xs" /><button type="submit" disabled={loading} className="rounded-lg bg-[#2e9e85] px-3 py-2.5 text-xs font-bold text-white">Upload PDF</button></form>{courses.length > 0 && <div className="mt-3 grid gap-2">{courses.map((course) => <div key={course.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#efeff5] px-3 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-bold">{course.title}</p><p className="truncate text-[11px] text-[#999aa8]">{course.subtitle}</p></div><button type="button" onClick={() => removeCourse(course.title)} disabled={loading} className="shrink-0 rounded-lg p-2 text-[#c65d59] hover:bg-[#fff0ef]" aria-label={`Delete ${course.title}`}><Trash2 className="size-4" /></button></div>)}</div>}</div>
    <div className={`${adminSection === 'pdfs' ? '' : 'hidden'} mt-4 rounded-xl border border-[#ecebf6] bg-white p-3 sm:mt-5 sm:p-4`}><div className="flex items-center justify-between gap-2"><div><h3 className="text-sm font-bold">Manage PDF notes</h3><p className="mt-1 text-xs text-[#888998]">Rename or delete uploaded PDFs.</p></div><button type="button" onClick={loadNotes} className="rounded-lg border border-[#dfddfa] px-3 py-2 text-xs font-bold text-[#6657e8]">Load PDFs</button></div><form action={uploadNotes} className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-[#deddec] p-3 sm:flex-row sm:items-center"><select name="courseTitle" required aria-label="PDF course" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm"><option value="">Select course</option>{['Artificial Intelligence', 'Deep Learning', 'Machine Learning', 'Full Stack Development', 'SQL'].map((title) => <option key={title} value={title}>{title}</option>)}</select><input name="file" required type="file" accept="application/pdf,.pdf" aria-label="Choose PDF file" className="min-w-0 flex-1 text-xs" /><button type="submit" disabled={loading} className="rounded-lg bg-[#6657e8] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Upload PDF</button></form><div className="mt-3 grid gap-2">{notes.map((note) => <div key={note.id} className="flex min-w-0 flex-col gap-2 rounded-lg border border-[#ecebf6] p-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-[#3f4055]">{note.title}</p><p className="mt-1 text-[10px] text-[#999aa8]">{note.courseTitle}</p></div>{editingNote === note.id ? <form className="flex min-w-0 gap-2" onSubmit={(event) => { event.preventDefault(); void updateNote(note.id, new FormData(event.currentTarget).get('title') as string) }}><input name="title" defaultValue={note.title} aria-label="PDF title" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-2 py-2 text-xs" /><button className="rounded-lg bg-[#6657e8] px-3 py-2 text-[10px] font-bold text-white">Save</button></form> : <div className="flex shrink-0 gap-2"><button type="button" onClick={() => setEditingNote(note.id)} className="rounded-lg border border-[#dfddfa] px-3 py-2 text-[10px] font-bold text-[#6657e8]">Update</button><button type="button" onClick={() => void deleteNote(note.id)} className="rounded-lg border border-[#f2dada] px-3 py-2 text-[10px] font-bold text-[#b94a4a]">Delete</button></div>}</div>)}</div></div><div className={`${adminSection === 'lessons' ? '' : 'hidden'} mt-4 rounded-xl border border-[#ecebf6] bg-white p-3 sm:mt-5 sm:p-4`}><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><h3 className="text-sm font-bold">Manage YouTube lessons</h3><div className="flex gap-2"><select value={videoCourse} onChange={(event) => setVideoCourse(event.target.value)} aria-label="Lesson course" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-2 py-2 text-xs sm:w-48"><option value="">Select course</option>{[{ id: 'ai', title: 'Artificial Intelligence', icon: 'AI' }, { id: 'dl', title: 'Deep Learning', icon: 'DL' }, { id: 'ml', title: 'Machine Learning', icon: 'ML' }, { id: 'fs', title: 'Full Stack Development', icon: 'FS' }, { id: 'sql', title: 'SQL', icon: 'DB' }, ...courses.filter((course) => !['Artificial Intelligence', 'Deep Learning', 'Machine Learning', 'Full Stack Development', 'SQL'].includes(course.title))].map((course) => <option key={course.id} value={course.title}>{course.icon} {course.title}</option>)}</select><button type="button" onClick={() => loadVideos()} disabled={loading || !videoCourse} className="rounded-lg border border-[#dfddfa] px-3 py-2 text-xs font-bold text-[#6657e8]">Load</button></div></div><form action={submitVideo} className="mt-3 grid min-w-0 gap-2 sm:grid-cols-4"><select name="courseTitle" required aria-label="Course" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]"><option value="">Select course</option>{[{ id: 'ai', title: 'Artificial Intelligence', icon: 'AI' }, { id: 'dl', title: 'Deep Learning', icon: 'DL' }, { id: 'ml', title: 'Machine Learning', icon: 'ML' }, { id: 'fs', title: 'Full Stack Development', icon: 'FS' }, { id: 'sql', title: 'SQL', icon: 'DB' }, ...courses.filter((course) => !['Artificial Intelligence', 'Deep Learning', 'Machine Learning', 'Full Stack Development', 'SQL'].includes(course.title))].map((course) => <option key={course.id} value={course.title}>{course.icon} {course.title}</option>)}</select><input name="title" required placeholder="Lesson title" aria-label="Lesson title" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><input name="youtubeUrl" required type="url" placeholder="YouTube URL" aria-label="YouTube URL" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><div className="flex gap-2"><input name="part" type="number" min="1" defaultValue="1" placeholder="Part" aria-label="Video part" className="w-16 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><input name="position" type="number" min="0" placeholder="#" aria-label="Lesson position" className="w-16 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><button type="submit" disabled={loading} className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#6657e8] px-3 text-xs font-bold text-white disabled:opacity-50">Add lesson</button></div></form>{videos.length > 0 && <div className="mt-3 grid gap-2">{videos.map((video) => editingVideo === video.id ? <form key={video.id} action={saveVideo} className="grid gap-2 rounded-lg border border-[#dfddfa] bg-[#faf9ff] p-3 sm:grid-cols-[1fr_1fr_70px_auto_auto]"><input type="hidden" name="id" value={video.id} /><input name="title" defaultValue={video.title} required aria-label="Edit lesson title" className="rounded-lg border border-[#e6e6ef] px-2 py-2 text-xs" /><input name="youtubeUrl" defaultValue={video.youtubeUrl} required type="url" aria-label="Edit YouTube URL" className="rounded-lg border border-[#e6e6ef] px-2 py-2 text-xs" /><input name="part" defaultValue={video.part} type="number" min="1" aria-label="Edit video part" className="rounded-lg border border-[#e6e6ef] px-2 py-2 text-xs" /><input name="position" defaultValue={video.position} type="number" min="0" aria-label="Edit lesson position" className="rounded-lg border border-[#e6e6ef] px-2 py-2 text-xs" /><button type="submit" disabled={loading} className="rounded-lg bg-[#6657e8] px-3 py-2 text-xs font-bold text-white">Save</button><button type="button" onClick={() => setEditingVideo(null)} className="rounded-lg border px-3 py-2 text-xs font-bold">Cancel</button></form> : <div key={video.id} className="flex min-w-0 items-center justify-between gap-2 rounded-lg border border-[#efeff5] p-3"><div className="min-w-0"><p className="truncate text-xs font-bold">{video.position + 1}. {video.title}</p><p className="truncate text-[11px] text-[#999aa8]">{video.youtubeUrl}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => setEditingVideo(video.id)} className="rounded-lg p-2 text-[#6657e8] hover:bg-[#f0efff]" aria-label={`Edit ${video.title}`}><Pencil className="size-4" /></button><button type="button" onClick={() => removeVideo(video.id)} disabled={loading} className="rounded-lg p-2 text-[#c65d59] hover:bg-[#fff0ef]" aria-label={`Delete ${video.title}`}><Trash2 className="size-4" /></button></div></div>)}</div>}</div>
    <form action={submit} className={`${adminSection === 'students' ? '' : 'hidden'} mt-4 grid min-w-0 gap-2 rounded-xl border border-[#ecebf6] bg-white p-3 sm:mt-5 sm:gap-3 sm:p-4 sm:grid-cols-3`}>
      <input name="name" required placeholder="Student name" aria-label="Student name" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" />
      <input name="email" required type="email" placeholder="Student email" aria-label="Student email" className="rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" />
      <div className="flex gap-2"><input name="password" required minLength={8} type="password" placeholder="Password" aria-label="Student password" className="min-w-0 flex-1 rounded-lg border border-[#e6e6ef] px-3 py-2.5 text-sm outline-none focus:border-[#6657e8]" /><button type="submit" disabled={loading} aria-label="Create student account" className="inline-flex items-center justify-center rounded-lg bg-[#6657e8] px-3 text-white disabled:opacity-50"><UserPlus className="size-4" /></button></div>
    </form>
    {message && <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#2e9e85]"><Check className="size-3.5" />{message}</p>}
    {error && <p className="mt-3 text-xs font-semibold text-[#c65d59]">{error}</p>}
    <div className={`${adminSection === 'accounts' ? '' : 'hidden'} mt-5 rounded-xl border border-[#ecebf6] bg-white p-3 sm:p-4`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold">Login accounts</h3><p className="mt-1 text-xs text-[#888998]">Names, emails, roles, and account creation dates. Passwords are never displayed.</p></div><button type="button" onClick={loadAccounts} disabled={loading} className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#dfddfa] px-3 py-2 text-xs font-bold text-[#6657e8] disabled:opacity-50"><RefreshCw className="size-3.5" /> Load accounts</button></div>{accounts.length > 0 ? <div className="mt-3 grid gap-2">{accounts.map((account) => <div key={account.id} className="flex min-w-0 flex-col gap-2 rounded-lg border border-[#efeff5] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate text-xs font-bold">{account.name}</p><p className="truncate text-[11px] text-[#888998]">{account.email}</p></div><div className="flex items-center justify-between gap-3 sm:justify-end"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${account.role === 'Admin' ? 'bg-[#f0efff] text-[#6657e8]' : 'bg-[#eaf8f4] text-[#2e9e85]'}`}>{account.role}</span><span className="text-[10px] text-[#999aa8]">{new Date(account.createdAt).toLocaleDateString()}</span></div></div>)}</div> : <p className="mt-3 rounded-lg border border-dashed border-[#deddec] px-3 py-4 text-center text-xs text-[#999aa8]">Load the account list to view login identities.</p>}</div>
    <div className={`${adminSection === 'students' ? '' : 'hidden'} mt-5 grid gap-3`}>
      {students.length === 0 ? <p className="rounded-xl border border-dashed border-[#deddec] px-4 py-6 text-center text-xs text-[#999aa8]">Refresh the roster to load student login and performance data.</p> : students.map((student) => <div key={student.id} className="rounded-xl border border-[#ecebf6] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{student.name}</p><p className="mt-1 text-xs text-[#888998]">{student.email}</p></div><span className="rounded-full bg-[#f0efff] px-2 py-1 text-[10px] font-bold text-[#6657e8]">{student.courseProgress}% progress</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-[#fff8e7] p-2"><p className="text-sm font-bold">{student.streakDays}</p><p className="text-[10px] text-[#999aa8]">streak</p></div><div className="rounded-lg bg-[#f1f0ff] p-2"><p className="text-sm font-bold">{student.studyMinutes}m</p><p className="text-[10px] text-[#999aa8]">study time</p></div><div className="rounded-lg bg-[#eaf8f4] p-2"><p className="text-sm font-bold">{student.xp}</p><p className="text-[10px] text-[#999aa8]">XP</p></div></div></div>)}
    </div>
  </section>
}

