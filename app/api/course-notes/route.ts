import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const pathname = new URL(request.url).searchParams.get('pathname')
  if (!pathname || !pathname.startsWith('https://')) return NextResponse.json({ error: 'Invalid notes URL.' }, { status: 400 })
  return NextResponse.redirect(pathname)
}
