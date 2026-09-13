'use client'

import { useEffect, useRef, useState } from 'react'
import { getCourseVideos } from '@/app/actions/admin'
import { Check, ChevronLeft, ChevronRight, Loader2, PlayCircle } from 'lucide-react'

type Video = Awaited<ReturnType<typeof getCourseVideos>>[number]

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const id = parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v')
    return id ? `https://www.youtube.com/embed/${id}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}` : url
  } catch {
    return url
  }
}

export function CourseVideoPlayer({ courseTitle, onClose }: { courseTitle: string; onClose: () => void }) {
  const [videos, setVideos] = useState<Video[] | null>(null)
  const [current, setCurrent] = useState(0)
  const playingRef = useRef(false)
  const pendingSecondsRef = useRef(0)

  async function sendStudyTime() {
    const seconds = Math.min(Math.floor(pendingSecondsRef.current), 120)
    if (seconds <= 0) return
    pendingSecondsRef.current -= seconds
    try {
      await fetch('/api/study-time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seconds }) })
    } catch {
      pendingSecondsRef.current += seconds
    }
  }

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data?.event === 'onStateChange') playingRef.current = data.info === 1
      } catch {}
    }
    window.addEventListener('message', onMessage)
    const timer = window.setInterval(() => { if (playingRef.current) pendingSecondsRef.current += 30; void sendStudyTime() }, 30000)
    return () => { window.removeEventListener('message', onMessage); window.clearInterval(timer); void sendStudyTime() }
  }, [])

  async function loadVideos() {
    setVideos(await getCourseVideos(courseTitle))
  }

  if (videos === null) {
    loadVideos()
    return <div className="rounded-2xl border border-[#e5e2ff] bg-white p-6 text-center"><Loader2 className="mx-auto size-5 animate-spin text-[#6657e8]" /><p className="mt-2 text-xs text-[#77798b]">Loading lessons...</p></div>
  }

  const video = videos[current]
  return <section className="rounded-2xl border border-[#e5e2ff] bg-white p-4 shadow-[0_8px_24px_rgba(83,72,196,0.08)] sm:p-6">
    <div className="mb-4 flex items-start justify-between gap-3"><div><button type="button" onClick={() => { void sendStudyTime(); onClose() }} className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-[#6657e8]"><ChevronLeft className="size-3.5" /> Back to courses</button><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a2a3af]">{courseTitle}</p><h2 className="mt-1 text-xl font-bold tracking-[-0.03em]">Course lessons</h2></div><span className="rounded-full bg-[#f0efff] px-2.5 py-1 text-[10px] font-bold text-[#6657e8]">{new Set(videos.map((item) => item.part)).size} parts · {videos.length} lessons</span></div>
    {video ? <><div className="aspect-video overflow-hidden rounded-xl bg-[#202238]"><iframe className="size-full" src={getEmbedUrl(video.youtubeUrl)} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="mt-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a2a3af]">Lesson {current + 1} of {videos.length}</p><h3 className="mt-1 text-sm font-bold">{video.title}</h3></div><div className="flex gap-2"><button type="button" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} className="rounded-lg border border-[#e8e7f0] p-2 text-[#6657e8] disabled:opacity-35" aria-label="Previous lesson"><ChevronLeft className="size-4" /></button><button type="button" disabled={current === videos.length - 1} onClick={() => setCurrent((value) => value + 1)} className="rounded-lg bg-[#6657e8] p-2 text-white disabled:opacity-35" aria-label="Next lesson"><ChevronRight className="size-4" /></button></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{videos.map((item, index) => <button type="button" key={item.id} onClick={() => setCurrent(index)} className={`flex items-center gap-3 rounded-xl p-3 text-left ${index === current ? 'bg-[#f0efff] text-[#5143c2]' : 'bg-[#fafafa] text-[#666778]'}`}><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-sm">{index < current ? <Check className="size-3.5" /> : index + 1}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold"><span className="mr-2 inline-flex rounded-full bg-[#f0efff] px-2 py-0.5 text-[9px] font-bold text-[#6657e8]">Part {item.part}</span>{item.title}</span><PlayCircle className="size-4 shrink-0" /></button>)}</div></> : <div className="rounded-xl border border-dashed border-[#deddec] p-8 text-center"><PlayCircle className="mx-auto size-7 text-[#aaaab5]" /><p className="mt-3 text-sm font-bold">Lessons coming soon</p><p className="mt-1 text-xs text-[#999aa8]">Your admin will add YouTube lessons here.</p></div>}
  </section>
}
