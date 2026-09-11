'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { AdminPanel } from '@/components/admin-panel'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  Flame,
  Home,
  Library,
  Menu,
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

const courses = [
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
  const { data: session } = authClient.useSession()
  const profileName = session?.user?.name?.trim() || session?.user?.email?.split('@')[0] || 'Student'
  const profileEmail = session?.user?.email || 'student@lumalearn.com'
  const profileInitials = profileName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const currentHour = new Date().getHours()
  const timeGreeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  function sendMessage(text = input) {
    const clean = text.trim()
    if (!clean) return
    setMessages((current) => [...current, { role: 'user', text: clean }, { role: 'assistant', text: 'Let\'s break that down step by step. Start by identifying the inner function and the outer function. Once we name those, the next move becomes much clearer.' }])
    setInput('')
  }

  return (
    <div className="flex min-h-screen bg-[#f7f8fc] text-[#202238]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col border-r border-[#e8e9f1] bg-white px-5 py-6 transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-11 flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#6657e8] text-white shadow-[0_6px_14px_rgba(102,87,232,0.28)]"><Sparkles className="size-4" /></div>
            <span className="text-[17px] font-bold tracking-[-0.04em]">LumaLearn</span>
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
      <main className="min-w-0 flex-1">
        <header className="flex h-[76px] items-center justify-between border-b border-[#e9eaf1] bg-white/70 px-5 sm:px-8 lg:px-10">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <div className="hidden lg:block"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#a2a3af]">Monday, October 14, 2024</p><p className="mt-1 text-[13px] text-[#77798b]">A little progress every day.</p></div>
          <div className="ml-auto flex items-center gap-3"><button className="relative rounded-full p-2 text-[#898b9a] hover:bg-[#f4f4f8]" aria-label="Notifications"><CircleHelp className="size-[19px]" /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#ef7767]" /></button><div className="flex size-9 items-center justify-center rounded-full bg-[#f7d7ca] text-xs font-bold text-[#9d654d]">{profileInitials}</div></div>
        </header>
        <div className="mx-auto max-w-[1450px] p-5 pb-24 sm:p-8 sm:pb-24 lg:p-10 lg:pb-10">
          <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-[#73758a]">{timeGreeting}, {profileName}</p><h1 className="text-[30px] font-bold tracking-[-0.045em] text-[#23243a] sm:text-[35px]">Ready to make progress?</h1></div><button className="flex w-fit items-center gap-2 rounded-xl bg-[#6657e8] px-4 py-2.5 text-[12px] font-bold text-white shadow-[0_5px_12px_rgba(102,87,232,0.2)] hover:bg-[#5748d6]"><Plus className="size-4" /> Add a goal</button></section>
          {activeNav === 'Home' ? <div className="max-w-4xl">
            <section className="mb-6 grid gap-4 sm:grid-cols-3">
              <StatCard icon={<Flame className="size-[19px]" />} iconBg="bg-[#fff1d0]" iconColor="text-[#e4a82e]" label="Current streak" value="12 days" note="Personal best: 18 days" />
              <StatCard icon={<Clock3 className="size-[19px]" />} iconBg="bg-[#e8e7ff]" iconColor="text-[#6657e8]" label="Study time" value="4h 20m" note="+18% from last week" />
              <StatCard icon={<Zap className="size-[19px]" />} iconBg="bg-[#ddf5ef]" iconColor="text-[#36a58b]" label="XP earned" value="1,240" note="380 XP to next level" />
            </section>
            <section className="rounded-2xl border border-[#e9eaf2] bg-white p-5 shadow-[0_3px_10px_rgba(34,35,65,0.02)] sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-[16px] font-bold">Learning performance</h2><p className="mt-1 text-[12px] text-[#9495a3]">Your study activity and streaks at a glance</p></div><select className="rounded-lg border border-[#ebebf0] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#6f7182] outline-none"><option>Last 7 days</option></select></div><div className="flex h-[130px] items-end justify-between gap-2 px-2">{[35, 55, 44, 76, 62, 88, 42].map((height, i) => <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={i}><div className={`w-full max-w-[42px] rounded-t-md ${i === 5 ? 'bg-[#6657e8]' : 'bg-[#e5e3fc]'}`} style={{ height: `${height}%` }} /><span className="text-[10px] font-medium text-[#a7a8b3]">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span></div>)}</div></section>
          </div> : <SectionView activeNav={activeNav} courses={courses} />}
          <AdminPanel email={profileEmail} />
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#e8e9f1] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(34,35,65,0.08)] backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {[{ label: 'Home', icon: Home }, { label: 'Courses', icon: Library }, { label: 'AI tutor', icon: MessageCircle }, { label: 'Planner', icon: Target }].map(({ label, icon: Icon }) => {
          const navValue = label === 'Courses' ? 'My courses' : label === 'Planner' ? 'Study planner' : label
          const isActive = activeNav === navValue
          return <button key={label} type="button" onClick={() => setActiveNav(navValue)} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition-colors ${isActive ? 'text-[#6657e8]' : 'text-[#999aa8]'}`} aria-current={isActive ? 'page' : undefined}><Icon className={`size-[18px] ${isActive ? 'stroke-[2.5]' : ''}`} />{label}</button>
        })}
      </nav>
    </div>
  )
}

function SectionView({ activeNav, courses }: { activeNav: string; courses: typeof courses }) {
  if (activeNav === 'My courses') {
    return <section className="rounded-2xl border border-[#e9eaf2] bg-white p-5 shadow-[0_3px_10px_rgba(34,35,65,0.02)] sm:p-6"><div className="mb-5"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a2a3af]">Your library</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">My courses</h2><p className="mt-1 text-sm text-[#9495a3]">Track every course in one focused space.</p></div><div className="grid gap-3">{courses.map((course) => <CourseCard key={course.title} course={course} />)}</div></section>
  }
  if (activeNav === 'AI tutor') return <div className="mx-auto max-w-2xl"><AssistantPanel messages={initialMessages} input="" setInput={() => undefined} onSend={() => undefined} /></div>
  return <section className="rounded-2xl border border-[#e9eaf2] bg-white p-5 shadow-[0_3px_10px_rgba(34,35,65,0.02)] sm:p-6"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a2a3af]">Stay on track</p><h2 className="mt-2 text-2xl font-bold tracking-[-0.04em]">Study planner</h2><p className="mt-1 text-sm text-[#9495a3]">Plan your next study session and keep your momentum going.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#faf8f1] p-4"><p className="text-xs font-bold text-[#383747]">Today&apos;s goal</p><p className="mt-2 text-2xl font-bold">45 min</p><p className="mt-1 text-xs text-[#91909b]">12 minutes remaining</p></div><div className="rounded-xl bg-[#f0efff] p-4"><p className="text-xs font-bold text-[#4e42b6]">Next up</p><p className="mt-2 text-sm font-bold">Calculus II</p><p className="mt-1 text-xs text-[#77798b]">Integration techniques</p></div></div></section>
}

function StatCard({ icon, iconBg, iconColor, label, value, note }: { icon: React.ReactNode; iconBg: string; iconColor: string; label: string; value: string; note: string }) { return <div className="rounded-2xl border border-[#e9eaf2] bg-white p-4 shadow-[0_3px_10px_rgba(34,35,65,0.02)]"><div className={`mb-3 flex size-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>{icon}</div><p className="text-[11px] font-semibold text-[#9798a5]">{label}</p><p className="mt-1 text-[21px] font-bold tracking-[-0.03em]">{value}</p><p className="mt-1 text-[10px] text-[#9b9ca8]">{note}</p></div> }

function CourseCard({ course }: { course: typeof courses[number] }) { const colors = { violet: 'bg-[#eeecff] text-[#6657e8]', teal: 'bg-[#e1f6f1] text-[#2e9e85]', amber: 'bg-[#fff2d8] text-[#d79c25]' }; return <div className="group flex items-center gap-3 rounded-xl border border-[#f0f0f5] p-3 transition-colors hover:border-[#dfddfa] hover:bg-[#fbfaff]"><div className={`flex size-11 shrink-0 items-center justify-center rounded-xl text-[23px] font-medium ${colors[course.color as keyof typeof colors]}`}>{course.icon}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><p className="truncate text-[13px] font-bold">{course.title}</p><p className="mt-0.5 truncate text-[11px] text-[#999aa8]">{course.subtitle}</p></div><span className="text-[12px] font-bold text-[#55566d]">{course.progress}%</span></div><div className="mt-3 flex items-center gap-2"><div className="h-1.5 flex-1 rounded-full bg-[#f0f0f5]"><div className={`h-full rounded-full ${course.color === 'violet' ? 'bg-[#7062e6]' : course.color === 'teal' ? 'bg-[#4cb59d]' : 'bg-[#e4b23b]'}`} style={{ width: `${course.progress}%` }} /></div><span className="hidden text-[10px] text-[#a0a1ad] sm:block">{course.lessons}</span></div></div><button aria-label={`Continue ${course.title}`} className="rounded-lg p-2 text-[#a4a5b0] hover:bg-[#efefff] hover:text-[#6657e8]"><Play className="size-4 fill-current" /></button></div> }

function AssistantPanel({ messages, input, setInput, onSend }: { messages: { role: string; text: string }[]; input: string; setInput: (v: string) => void; onSend: (text?: string) => void }) { return <section className="flex min-h-[590px] flex-col overflow-hidden rounded-2xl border border-[#e6e3ff] bg-white shadow-[0_8px_24px_rgba(83,72,196,0.06)]"><div className="flex items-center gap-3 border-b border-[#efeff6] bg-[#fbfaff] px-5 py-4"><div className="flex size-9 items-center justify-center rounded-xl bg-[#6657e8] text-white"><Brain className="size-[18px]" /></div><div><h2 className="text-[14px] font-bold">Doubt Assistant</h2><div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#8b8c9a]"><span className="size-1.5 rounded-full bg-[#50b89b]" /> Always here to help</div></div><button className="ml-auto rounded-lg p-2 text-[#aaaab5] hover:bg-[#efeffa]" aria-label="Assistant options"><MoreHorizontal className="size-[18px]" /></button></div><div className="flex-1 space-y-4 overflow-auto p-5">{messages.map((message, index) => <div key={index} className={`flex gap-2.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}><div className={`flex size-7 shrink-0 items-center justify-center rounded-full ${message.role === 'assistant' ? 'bg-[#eeecff] text-[#6657e8]' : 'bg-[#f7d7ca] text-[9px] font-bold text-[#9d654d]'}`}>{message.role === 'assistant' ? <Sparkles className="size-3.5" /> : 'MC'}</div><div className={`max-w-[83%] rounded-2xl px-3.5 py-3 text-[12px] leading-5 ${message.role === 'assistant' ? 'rounded-tl-sm bg-[#f5f4fd] text-[#57586c]' : 'rounded-tr-sm bg-[#6657e8] text-white'}`}>{message.text}</div></div>)}<div className="rounded-xl border border-[#ecebf6] bg-[#fcfcfe] p-3.5"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-[#62637a]"><BookOpen className="size-3.5 text-[#6657e8]" /> Try asking me to...</div><div className="flex flex-wrap gap-2">{['Explain it simply', 'Give me a hint', 'Show an example'].map((suggestion) => <button key={suggestion} onClick={() => onSend(suggestion)} className="rounded-lg border border-[#e7e6f0] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#747588] hover:border-[#c9c5fa] hover:text-[#6657e8]">{suggestion}</button>)}</div></div></div><div className="border-t border-[#efeff6] p-4"><div className="flex items-center gap-2 rounded-xl border border-[#e5e5ef] bg-[#fcfcfe] px-3 py-2 focus-within:border-[#aaa2f1] focus-within:ring-2 focus-within:ring-[#eeecff]"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) onSend() }} placeholder="Ask anything you&apos;re curious about..." className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#b0b1bc]" aria-label="Ask the doubt assistant" /><button onClick={() => onSend()} className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#6657e8] text-white hover:bg-[#5748d6]" aria-label="Send question"><Send className="size-3.5" /></button></div><p className="mt-2 text-center text-[10px] text-[#b0b1bc]">AI can make mistakes. Check important answers.</p></div></section> }
