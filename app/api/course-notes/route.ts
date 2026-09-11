import { get } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pathname = new URL(request.url).searchParams.get('pathname')
  if (!pathname || !pathname.startsWith('course-notes/')) return NextResponse.json({ error: 'Invalid notes path.' }, { status: 400 })
  const result = await get(pathname, { access: 'private' })
  if (!result) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType, 'Cache-Control': 'private, no-cache', ETag: result.blob.etag } })
}
