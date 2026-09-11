import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'
import { auth } from '@/lib/auth'

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')
  return <AuthForm mode="sign-up" />
}
