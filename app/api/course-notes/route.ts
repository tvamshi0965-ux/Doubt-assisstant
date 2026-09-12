import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pathname = new URL(request.url).searchParams.get('pathname')
  if (!pathname) return NextResponse.json({ error: 'Missing notes URL.' }, { status: 400 })

  let notesUrl: URL
  try { notesUrl = new URL(pathname) } catch { return NextResponse.json({ error: 'Invalid notes URL.' }, { status: 400 }) }
  if (notesUrl.protocol !== 'https:' || !notesUrl.hostname.endsWith('.vercel-storage.com')) return NextResponse.json({ error: 'Invalid notes host.' }, { status: 400 })

  const response = await fetch(notesUrl, { cache: 'no-store' })
  if (!response.ok || !response.body) return NextResponse.json({ error: 'PDF notes are unavailable.' }, { status: 404 })

  return new NextResponse(response.body, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="course-notes.pdf"',
      'Cache-Control': 'private, no-store',
    },
  })
}
