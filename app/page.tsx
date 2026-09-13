'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { AdminPanel } from '@/components/admin-panel'
import { CourseVideoPlayer } from '@/components/course-video-player'
import { getPublicCourses } from '@/app/actions/admin'
import useSWR from 'swr'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  CircleUserRound,
  Clock3,
  ShieldCheck,
  Flame,
  Home,
  Library,
  MessageCircle,
  MoreHorizontal,
  Play,
  Plus,
  Send,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react'

const defaultCourses = [
  { title: 'Artificial Intelligence', subtitle: 'Foundations of intelligent systems', progress: 72, color: 'violet', icon: 'AI', lessons: '18 of 25 lessons' },
  { title: 'Deep Learning', subtitle: 'Neural networks and model training', progress: 46, color: 'teal', icon: 'DL', lessons: '11 of 24 lessons' },
  { title: 'Machine Learning', subtitle: 'Models, data, and predictions', progress: 28, color: 'amber', icon: 'ML', lessons: '7 of 26 lessons' },
  { title: 'Full Stack Development', subtitle: 'Build modern web applications', progress: 18, color: 'violet', icon: 'FS', lessons: '5 of 28 lessons' },
  { title: 'SQL', subtitle: 'Query and manage relational data', progress: 12, color: 'teal', icon: 'DB', lessons: '3 of 20 lessons' },
]

const initialMessages = [
  { role: 'assistant', text: 'Hi there! I\'m here to help you understand, not just memorize. What are you working through today?' },
  { role: 'user', text: 'I\'m stuck on why the chain rule works for integration.' },
  { role: 'assistant', text: 'Great question. Think of integration as reversing a chain rule step. When you see a function nested inside another, we can “unwrap” the outside first. Want to walk through an example together?' },
]

export default function Page() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [signingOut, setSigningOut] = useState(false)
  const [input, setInput] = useState('')
  const [activeNav, setActiveNav] = useState('Home')
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [learningStarted, setLearningStarted] = useState(false)
  const [plannerCourse, setPlannerCourse] = useState('Artificial Intelligence')
  const [plannerOpen, setPlannerOpen] = useState(false)
  const [studyPlan, setStudyPlan] = useState<string | null>(null)
  const { data: session } = authClient.useSession()
  const { data: managedCourses = [] } = useSWR('public-courses', getPublicCourses, { revalidateOnFocus: true, revalidateOnMount: true, dedupingInterval: 0 })
  const { data: studyTime } = useSWR<{ seconds: number }>('/api/study-time', (url) => fetch(url).then((response) => response.json()), { refreshInterval: 30000 })
  const studyMinutes = Math.floor((studyTime?.seconds ?? 0) / 60)
  const courses = defaultCourses.map((course) => ({ ...course, ...(managedCourses.find((managedCourse) => managedCourse.title === course.title) ?? {}), notesPathname: managedCourses.find((managedCourse) => managedCourse.title === course.title)?.notesPathname ?? null, notes: managedCourses.find((managedCourse) => managedCourse.title === course.title)?.notes ?? [] })).concat(managedCourses.filter((course) => !defaultCourses.some((defaultCourse) => defaultCourse.title === course.title)).map((course) => ({ ...course, progress: 0, lessons: 'Not started', notes: course.notes ?? [] })))
  const profileName = session?.user?.name?.trim() || session?.user?.email?.split('@')[0] || 'Student'
  const profileEmail = session?.user?.email || 'student@lumalearn.com'
  const profileInitials = profileName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const [timeGreeting, setTimeGreeting] = useState('')
  const learningStartDate = session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'today'

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const currentHour = now.getHours()
      setTimeGreeting(currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening')
    }
    updateDateTime()
    const timer = window.setInterval(updateDateTime, 60000)
    return () => window.clearInterval(timer)
  }, [])

  async function sendMessage(text = input) {
    const clean = text.trim()
    if (!clean) return
    setMessages((current) => [...current, { role: 'user', text: clean }, { role: 'assistant', text: 'Thinking...' }])
    setInput('')
    try {
      const response = await fetch('/api/doubt-assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: clean }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setMessages((current) => [...current.slice(0, -1), { role: 'assistant', text: result.answer }])
    } catch (error) {
      console.error('[v0] Doubt Assistant UI request failed:', error)
      setMessages((current) => [...current.slice(0, -1), { role: 'assistant', text: 'I could not answer right now. Please try again.' }])
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fc] text-[#202238]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col border-r border-[#e8e9f1] bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0 lg:shadow-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-11 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#6657e8] text-white shadow-[0_6px_14px_rgba(102,87,232,0.28)]"><Sparkles className="size-4" /></div>
            <span className="text-[17px] font-bold tracking-[-0.04em]">EDU TECH</span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
        </div>
        <nav className="flex flex-col gap-1.5" aria-label="Main navigation">
          {[{ label: 'Home', icon: Home }, { label: 'My courses', icon: Library }, { label: 'AI tutor', icon: MessageCircle }, { label: 'Study planner', icon: Target }].map(({ label, icon: Icon }) => (
            <button key={label} onClick={() => { setActiveNav(label); setSidebarOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-semibold transition-colors ${activeNav === label ? 'bg-[#f0efff] text-[#5b4cdb]' : 'text-[#77798b] hover:bg-[#f7f7fb] hover:text-[#36374c]'}`}>
              <Icon className="size-[18px]" />{label}
              {label === 'AI tutor' && <span className="ml-auto rounded-full bg-[#e8e5ff] px-1.5 py-0.5 text-[10px] font-bold text-[#6554df]">NEW</span>}
            </button>
          ))}
          {['tvamshi@gmail.com', 'tvamshi2007@gmail.com'].includes(profileEmail.toLowerCase()) && <button type="button" onClick={() => { setActiveNav('Administrator'); setSidebarOpen(false) }} className={`mt-3 flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[13px] font-semibold transition-colors ${activeNav === 'Administrator' ? 'border-[#ded9ff] bg-[#f0efff] text-[#5b4cdb]' : 'border-[#ecebf5] text-[#77798b] hover:bg-[#f7f7fb] hover:text-[#36374c]'}`}><ShieldCheck className="size-[18px]" />Administrator</button>}
        </nav>
        <div className="mt-auto rounded-2xl bg-[#faf8f1] p-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-[#fff0c9] text-[#d89712]"><Trophy className="size-[18px]" /></div>
          <p className="text-[13px] font-bold text-[#383747]">Keep your streak alive</p>
          <p className="mt-1 text-[11px] leading-4 text-[#91909b]">You’re 12 minutes away from your daily goal.</p>
          <div className="mt-3 h-1.5 rounded-full bg-[#f1e8d0]"><div className="h-full w-[78%] rounded-full bg-[#e9b83f]" /></div>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-[#eff0f4] pt-5">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#f7d7ca] text-xs font-bold text-[#9d654d]">{profileInitials}</div>
          <div className="min-w-0"><p className="truncate text-[12px] font-bold">{profileName}</p><p className="truncate text-[11px] text-[#999aa8]">{profileEmail}</p></div>
          <button
            type="button"
            onClick={async () => {
              setSigningOut(true)
              await authClient.signOut()
              router.push('/sign-in')
              router.refresh()
            }}
            disabled={signingOut}
            className="ml-auto rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[#8b8c9a] transition hover:bg-[#f4f3ff] hover:text-[#6657e8] disabled:opacity-50"
          >
            {signingOut ? 'Signing out…' : 'Log out'}
          </button>
        </div>
      </aside>

      {sidebarOpen && <button aria-label="Close navigation" className="fixed inset-0 z-20 bg-[#202238]/20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <header className="flex h-[64px] items-center justify-between border-b border-[#e9eaf1] bg-white/70 px-4 sm:h-[76px] sm:px-8 lg:px-10">
          <div className="flex items-center gap-2 lg:hidden"><div className="flex size-8 items-center justify-center rounded-lg bg-[#6657e8] text-white shadow-[0_4px_10px_rgba(102,87,232,0.25)]"><Sparkles className="size-4" /></div><span className="text-[16px] font-extrabold tracking-[-0.04em] text-[#6657e8]">EDU TECH</span></div>
          <div className="hidden lg:block" suppressHydrationWarning><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a2a3af]">Learning since {learningStartDate}</p><p className="mt-1 text-[13px] text-[#77798b]">Your performance starts from your first account activity.</p></div>
          <div className="ml-auto flex items-center gap-3"><button className="relative rounded-full p-2 text-[#898b9a] hover:bg-[#f4f4f8]" aria-label="Notifications"><CircleHelp className="size-[19px]" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#ef7767]" /></button><div className="flex size-9 items-center justify-center rounded-full bg-[#f7d7ca] text-xs font-bold text-[#9d654d]">{profileInitials}</div></div>
        </header>
        <div className="mx-auto w-full max-w-[1450px] p-3 pb-28 sm:p-8 sm:pb-24 lg:p-10 lg:pb-10">
          {activeNav === 'Home' && timeGreeting && <section className="mb-8"><p className="text-sm font-medium text-[#73758a]">{timeGreeting}, {profileName}</p></section>}
          {activeNav === 'Home' ? <div className="max-w-4xl">
            <section className="mb-6 grid min-w-0 gap-3 sm:grid-cols-3 sm:gap-4">
              <StatCard icon={<Flame className="size-[19px]" />} iconBg="bg-[#fff1d0]" iconColor="text-[#e4a82e]" label="Current streak" value={learningStarted ? '0 days' : 'Not started'} note={learningStarted ? 'Complete a lesson today' : 'Starts after your first lesson'} />
              <StatCard icon={<Clock3 className="size-[19px]" />} iconBg="bg-[#e8e7ff]" iconColor="text-[#6657e8]" label="Study time" value={learningStarted || studyMinutes > 0 ? `${studyMinutes} min` : 'Not started'} note={learningStarted || studyMinutes > 0 ? 'Video playback time today' : 'Starts after your first lesson'} />
              <StatCard icon={<Zap className="size-[19px]" />} iconBg="bg-[#ddf5ef]" iconColor="text-[#36a58b]" label="XP earned" value={learningStarted ? '0 XP' : 'Not started'} note={learningStarted ? 'Earn XP by completing lessons' : 'Starts after your first lesson'} />
            </section>
            <section className="rounded-2xl border border-[#e9eaf2] bg-white p-5 shadow-[0_3px_10px_rgba(34,35,65,0.02)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-[16px] font-bold">Learning performance</h2><p className="mt-1 text-[12px] text-[#9495a3]">{learningStarted ? 'Your study activity and streaks at a glance' : 'Start a course to begin tracking your performance'}</p></div>{learningStarted && <select className="rounded-lg border border-[#ebebf0] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#6f7182] outline-none"><option>Last 7 days</option></select>}</div>{learningStarted ? <div className="flex h-[130px] items-end justify-between gap-2 px-2">{[35, 55, 44, 76, 62, 88, 42].map((height, i) => <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={i}><div className={`w-full max-w-[42px] rounded-t-md ${i === 5 ? 'bg-[#6657e8]' : 'bg-[#e5e3fc]'}`} style={{ height: `${height}%` }} /><span className="text-[10px] font-medium text-[#a7a8b3]">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span></div>)}</div> : <div className="flex h-[130px] items-center justify-center rounded-xl bg-[#fafaff] text-center text-xs text-[#999aa8]">Your learning chart will appear after you start a course.</div>}</section>
          </div> : <SectionView activeNav={activeNav} courses={courses} profileName={profileName} profileEmail={profileEmail} profileInitials={profileInitials} learningStarted={learningStarted} onLogout={async () => { await authClient.signOut(); router.push('/sign-in'); router.refresh() }} messages={messages} input={input} setInput={setInput} onSend={sendMessage} selectedCourse={selectedCourse} onSelectCourse={(course) => { setSelectedCourse(course); setLearningStarted(true) }} onCloseCourse={() => setSelectedCourse(null)} plannerCourse={plannerCourse} setPlannerCourse={setPlannerCourse} plannerOpen={plannerOpen} setPlannerOpen={setPlannerOpen} studyPlan={studyPlan} setStudyPlan={setStudyPlan} />}
          <AdminPanel email={profileEmail} activeNav={activeNav} />
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[#e8e9f1] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(34,35,65,0.08)] backdrop-blur md:hidden" aria-label="Mobile navigation">
        {[{ label: 'Home', icon: Home }, { label: 'Courses', icon: Library }, { label: 'AI tutor', icon: MessageCircle }, { label: 'Planner', icon: Target }, { label: 'Profile', icon: CircleUserRound }].map(({ label, icon: Icon }) => {
          const navValue = label === 'Courses' ? 'My courses' : label === 'Planner' ? 'Study planner' : label
          const isActive = activeNav === navValue
          return <button key={label} type="button" onClick={() => setActiveNav(navValue)} className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[9px] font-semibold transition-colors sm:text-[10px] ${isActive ? 'text-[#6657e8]' : 'text-[#999aa8]'}`} aria-current={isActive ? 'page' : undefined}><Icon className={`size-[17px] ${isActive ? 'stroke-[2.5]' : ''}`} />{label}</button>
        })}
      </nav>
    </div>
  )
}

function SectionView({ activeNav, courses, profileName, profileEmail, profileInitials, learningStarted, onLogout, messages, input, setInput, onSend, selectedCourse, onSelectCourse, onCloseCourse, plannerCourse, setPlannerCourse, plannerOpen, setPlannerOpen, studyPlan, setStudyPlan }: { activeNav: string; courses: typeof courses; profileName: string; profileEmail: string; profileInitials: string; learningStarted: boolean; onLogout: () => void; messages: { role: string; text: string }[]; input: string; setInput: (value: string) => void; onSend: (text?: string) => void; selectedCourse: string | null; onSelectCourse: (title: string) => void; onCloseCourse: () => void; plannerCourse: string; setPlannerCourse: (course: string) => void; plannerOpen: boolean; setPlannerOpen: (open: boolean) => void; studyPlan: string | null; setStudyPlan: (plan: string | null) => void }) {
  const plannerNotes = courses.find((course) => course.title === plannerCourse)?.notes ?? []
  if (activeNav === 'Profile') return <section className="max-w-3xl rounded-2xl border border-[#e9eaf2] bg-white p-5 shadow-[0_3px_10px_rgba(34,35,65,0.02)] sm:p-6"><div className="flex items-center gap-4 border-b border-[#eff0f4] pb-6"><div className="flex size-16 items-center justify-center rounded-2xl bg-[#f7d7ca] text-xl font-bold text-[#9d654d]">{profileInitials}</div><div className="min-w-0"><h2 className="truncate text-xl font-bold">{profileName}</h2><p className="truncate text-sm text-[#8d8e9d]">{profileEmail}</p><p className="mt-1 text-xs font-semibold text-[#6657e8]">Student profile</p></div></div><div className="mt-6"><h3 className="text-base font-bold">Learning performance</h3><p className="mt-1 text-xs text-[#9495a3]">{learningStarted ? 'Your progress since you started learning.' : 'Start a course to begin tracking your performance.'}</p><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-[#fff8e9] p-4"><p className="text-xs font-semibold text-[#9a751d]">Streak</p><p className="mt-2 text-2xl font-bold">{learningStarted ? '0 days' : 'Not started'}</p></div><div className="rounded-xl bg-[#f0efff] p-4"><p className="text-xs font-semibold text-[#6657e8]">Study time</p><p className="mt-2 text-2xl font-bold">{learningStarted ? '0 min' : 'Not started'}</p></div><div className="rounded-xl bg-[#eaf8f4] p-4"><p className="text-xs font-semibold text-[#2e9e85]">XP earned</p><p className="mt-2 text-2xl font-bold">{learningStarted ? '0 XP' : 'Not started'}</p></div></div><button type="button" onClick={onLogout} className="mt-6 w-full rounded-xl border border-[#ecebf4] px-4 py-3 text-left text-sm font-bold text-[#77798b] transition hover:border-[#6657e8] hover:text-[#6657e8]">Log out</button></div></section>
  if (activeNav === 'My courses') {
    if (selectedCourse) return <CourseVideoPlayer courseTitle={selectedCourse} onClose={onCloseCourse} />
    return <section className="w-full rounded-2xl border border-[#e9eaf2] bg-white p-3 shadow-[0_3px_10px_rgba(34,35,65,0.02)] sm:p-6"><div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a2a3af]">Your library</p><h2 className="mt-1.5 text-xl font-bold tracking-[-0.04em] sm:mt-2 sm:text-2xl">My courses</h2><p className="mt-1 text-xs text-[#9495a3] sm:text-sm">Track every course in one focused space.</p></div><label className="flex items-center gap-2 text-xs font-semibold text-[#77798b]">Select course<select value={selectedCourse ?? ''} onChange={(event) => event.target.value && onSelectCourse(event.target.value)} aria-label="Select a course" className="min-h-10 rounded-lg border border-[#e6e6ef] bg-white px-3 text-xs font-semibold text-[#55566d] outline-none focus:border-[#6657e8]"><option value="">Choose a course</option>{courses.map((course) => <option key={course.title} value={course.title}>{course.icon} {course.title}</option>)}</select></label></div><div className="grid min-w-0 gap-2 sm:gap-3">{courses.map((course) => <CourseCard key={course.title} course={course} learningStarted={learningStarted} onSelect={() => onSelectCourse(course.title)} />)}</div></section>
  }
  if (activeNav === 'AI tutor') return <div className="mx-auto max-w-2xl"><AssistantPanel messages={messages} input={input} setInput={setInput} onSend={onSend} /></div>
  return <section className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[#e9eaf2] bg-white p-3 shadow-[0_3px_10px_rgba(34,35,65,0.02)] sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a2a3af]">Study resources</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">PDF notes</h2></div><label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-[#77798b]"><select value={plannerCourse} onChange={(event) => setPlannerCourse(event.target.value)} aria-label="Select PDF notes course" className="min-h-10 w-full min-w-0 rounded-lg border border-[#dedcf5] bg-white px-3 text-xs font-semibold text-[#55566d] outline-none focus:border-[#6657e8] sm:w-auto sm:max-w-[190px]"><option value="">All PDF notes</option>{courses.filter((course) => course.notesPathname).map((course) => <option key={course.title} value={course.title}>{course.icon} {course.title}</option>)}</select></label></div><div className="mt-5"><p className="mb-2 text-xs font-bold text-[#55566d]">{plannerCourse ? `${plannerCourse} PDF list` : 'All uploaded PDF notes'}</p><div className="grid gap-3">{courses.flatMap((course) => (plannerCourse && course.title !== plannerCourse ? [] : (course.notes?.length ? course.notes.map((note) => ({ ...note, icon: course.icon })) : course.notesPathname ? [{ id: course.title, title: 'Course notes', pathname: course.notesPathname, courseTitle: course.title, icon: course.icon }] : []))).map((note) => <a key={note.id} href={note.pathname} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 rounded-xl border border-[#e6e6ef] bg-white p-3 transition hover:border-[#6657e8] hover:bg-[#fbfaff] sm:gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f0efff] text-sm font-bold text-[#6657e8]">{note.icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[#3f4055]">{note.title}</span><span className="mt-1 block text-[10px] font-semibold text-[#2e9e85]">PDF notes available</span></span><span className="shrink-0 rounded-lg bg-[#6657e8] px-2.5 py-2 text-[10px] font-bold text-white">Open PDF</span></a>)}{courses.every((course) => !course.notesPathname && !course.notes?.length) && <p className="rounded-lg border border-dashed border-[#deddec] p-4 text-center text-xs text-[#999aa8]">No PDF notes uploaded yet.</p>}</div></div></section>
}

function StatCard({ icon, iconBg, iconColor, label, value, note }: { icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string; note: string }) { return <div className="rounded-2xl border border-[#e9eaf2] bg-white p-4 shadow-[0_3px_10px_rgba(34,35,65,0.02)]"><div className={`mb-3 flex size-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>{icon}</div><p className="text-[11px] font-semibold text-[#9798a5]">{label}</p><p className="mt-1 text-[21px] font-bold tracking-[-0.03em]">{value}</p><p className="mt-1 text-[10px] text-[#9b9ca8]">{note}</p></div> }

function CourseCard({ course, learningStarted, onSelect }: { course: typeof courses[number]; learningStarted: boolean; onSelect: () => void }) { const colors = { violet: 'bg-[#eeecff] text-[#6657e8]', teal: 'bg-[#e1f6f1] text-[#2e9e85]', amber: 'bg-[#fff2d8] text-[#d79c25]' }; return <div className="group flex min-w-0 items-center gap-2 rounded-xl border border-[#f0f0f5] p-2.5 transition-colors hover:border-[#dfddfa] hover:bg-[#fbfaff] sm:gap-3 sm:p-3"><div className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:size-11 sm:rounded-xl sm:text-[23px] sm:font-medium ${colors[course.color as keyof typeof colors]}`}>{course.icon}</div><div className="min-w-0 flex-1"><div className="flex min-w-0 items-center justify-between gap-1.5 sm:gap-3"><div className="min-w-0"><p className="truncate text-[12px] font-bold sm:text-[13px]">{course.title}</p><p className="mt-0.5 truncate text-[10px] text-[#999aa8] sm:text-[11px]">{course.subtitle}</p></div>{learningStarted && <span className="shrink-0 text-[11px] font-bold text-[#55566d] sm:text-[12px]">{course.progress}%</span>}</div>{learningStarted ? <div className="mt-2 flex items-center gap-2 sm:mt-3"><div className="h-1.5 min-w-0 flex-1 rounded-full bg-[#f0f0f5]"><div className={`h-full rounded-full ${course.color === 'violet' ? 'bg-[#7062e6]' : course.color === 'teal' ? 'bg-[#4cb59d]' : 'bg-[#e4b23b]'}`} style={{ width: `${course.progress}%` }} /></div><span className="hidden text-[10px] text-[#a0a1ad] sm:block">{course.lessons}</span></div> : <span className="mt-2 block text-[10px] font-semibold text-[#6657e8] sm:mt-3">Start course</span>}</div><button type="button" onClick={onSelect} aria-label={`Open ${course.title} lessons`} className="shrink-0 rounded-lg p-1.5 text-[#a4a5b0] hover:bg-[#efefff] hover:text-[#6657e8] sm:p-2"><Play className="size-3.5 fill-current sm:size-4" /></button></div> }

function AssistantPanel({ messages, input, setInput, onSend }: { messages: { role: string; text: string }[]; input: string; setInput: (v: string) => void; onSend: (text?: string) => void }) { return <section className="flex min-h-[590px] flex-col overflow-hidden rounded-2xl border border-[#e6e3ff] bg-white shadow-[0_8px_24px_rgba(83,72,196,0.06)]"><div className="flex items-center gap-3 border-b border-[#efeff6] bg-[#fbfaff] px-5 py-4"><div className="flex size-9 items-center justify-center rounded-xl bg-[#6657e8] text-white"><Brain className="size-[18px]" /></div><div><h2 className="text-[14px] font-bold">Doubt Assistant</h2><div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8b8c9a]"><span className="size-1.5 rounded-full bg-[#50b89b]" /> Always here to help</div></div><button className="ml-auto rounded-lg p-2 text-[#aaaab5] hover:bg-[#efeffa]" aria-label="Assistant options"><MoreHorizontal className="size-[18px]" /></button></div><div className="flex-1 space-y-4 overflow-auto p-5">{messages.map((message, index) => <div key={index} className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}><div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${message.role === 'assistant' ? 'bg-[#eeecff] text-[#6657e8]' : 'bg-[#f7d7ca] text-[9px] font-bold text-[#9d654d]'}`}>{message.role === 'assistant' ? <Sparkles className="size-3.5" /> : 'MC'}</div><div className={`max-w-[83%] rounded-2xl px-3.5 py-3 text-[12px] leading-5 ${message.role === 'assistant' ? 'rounded-tl-sm bg-[#f5f4fd] text-[#57586c]' : 'rounded-tr-sm bg-[#6657e8] text-white'}`}>{message.text}</div></div>)}<div className="rounded-xl border border-[#ecebf6] bg-[#fcfcfe] p-3.5"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[#62637a]"><BookOpen className="size-3.5 text-[#6657e8]" /> Try asking me to...</div><div className="flex flex-wrap gap-2">{['Explain it simply', 'Give me a hint', 'Show an example'].map((suggestion) => <button key={suggestion} onClick={() => onSend(suggestion)} className="rounded-lg border border-[#e7e6f0] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#747588] hover:border-[#c9c5fa] hover:text-[#6657e8]">{suggestion}</button>)}</div></div></div><div className="border-t border-[#efeff6] p-4"><div className="flex items-center gap-2 rounded-xl border border-[#e5e5ef] bg-[#fcfcfe] px-3 py-2 focus-within:border-[#aaa2f1] focus-within:ring-2 focus-within:ring-[#eeecff]"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) onSend() }} placeholder="Ask anything you&apos;re curious about..." className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#b0b1bc]" aria-label="Ask the doubt assistant" /><button onClick={() => onSend()} className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#6657e8] text-white hover:bg-[#5748d6]" aria-label="Send question"><Send className="size-3.5" /></button></div><p className="mt-2 text-center text-[10px] text-[#b0b1bc]">AI can make mistakes. Check important answers.</p></div></section> }
