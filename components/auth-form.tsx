'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

type AuthFormProps = { mode: 'sign-in' | 'sign-up' }

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password })
    setPending(false)
    if (result.error) { setError('We could not complete that request. Check your details and try again.'); return }
    router.push('/')
    router.refresh()
  }

  return <main className="flex min-h-screen bg-[#f7f8fc] text-[#202238]">
    <section className="hidden flex-1 flex-col justify-between bg-[#6657e8] p-10 text-white lg:flex">
      <Link href="/" className="flex items-center gap-2.5 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-xl bg-white/15"><Sparkles className="size-4" /></span>LumaLearn</Link>
      <div className="max-w-md"><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white/65">Learn with clarity</p><h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.05em]">Small steps.<br />Big breakthroughs.</h1><p className="mt-6 text-base leading-7 text-white/75">Build momentum with courses designed around your pace, plus an AI tutor that never makes you feel stuck.</p></div>
      <p className="text-xs text-white/55">© 2024 LumaLearn</p>
    </section>
    <section className="flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-[530px] lg:px-16">
      <div className="w-full max-w-[370px]"><Link href="/" className="mb-12 flex items-center gap-2.5 text-lg font-bold lg:hidden"><span className="flex size-9 items-center justify-center rounded-xl bg-[#6657e8] text-white"><Sparkles className="size-4" /></span>LumaLearn</Link><div className="mb-8"><p className="mb-2 text-sm font-medium text-[#73758a]">{isSignUp ? 'Start your learning journey' : 'Welcome back'}</p><h2 className="text-3xl font-bold tracking-[-0.045em]">{isSignUp ? 'Create your account' : 'Sign in to LumaLearn'}</h2><p className="mt-3 text-sm leading-6 text-[#888997]">{isSignUp ? 'Your personalized study space is waiting.' : 'Pick up where you left off and keep your momentum going.'}</p></div>
        <form onSubmit={submit} className="flex flex-col gap-4"><div className="flex flex-col gap-2">{isSignUp && <><label htmlFor="name" className="text-xs font-bold text-[#5f6073]">Full name</label><input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-11 rounded-xl border border-[#e4e5ed] bg-white px-3.5 text-sm outline-none transition focus:border-[#6657e8] focus:ring-4 focus:ring-[#6657e8]/10" placeholder="Maya Chen" /></>}<label htmlFor="email" className="text-xs font-bold text-[#5f6073]">Email address</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl border border-[#e4e5ed] bg-white px-3.5 text-sm outline-none transition focus:border-[#6657e8] focus:ring-4 focus:ring-[#6657e8]/10" placeholder="you@example.com" /></div><div className="flex flex-col gap-2"><label htmlFor="password" className="text-xs font-bold text-[#5f6073]">Password</label><div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required className="h-11 w-full rounded-xl border border-[#e4e5ed] bg-white px-3.5 pr-11 text-sm outline-none transition focus:border-[#6657e8] focus:ring-4 focus:ring-[#6657e8]/10" placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9a9ba8]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>{error && <p role="alert" className="rounded-lg bg-[#fff0ee] px-3 py-2 text-xs text-[#c25d51]">{error}</p>}<button disabled={pending} className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6657e8] text-sm font-bold text-white shadow-[0_5px_12px_rgba(102,87,232,0.2)] transition hover:bg-[#5748d6] disabled:opacity-60">{pending ? 'Please wait...' : isSignUp ? 'Create account' : 'Sign in'}{!pending && <ArrowRight className="size-4" />}</button></form>
        <p className="mt-7 text-center text-sm text-[#858695]">{isSignUp ? 'Already have an account?' : 'New to LumaLearn?'} <Link href={isSignUp ? '/sign-in' : '/register'} className="font-bold text-[#6657e8] hover:underline">{isSignUp ? 'Sign in' : 'Create an account'}</Link></p>
      </div>
    </section>
  </main>
}
