import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const originValues = [
  process.env.BETTER_AUTH_URL,
  process.env.VERCEL_PROJECT_PRODUCTION_URL,
  process.env.VERCEL_URL,
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
]

const trustedOrigins = [
  'http://localhost:3000',
  ...originValues.filter(Boolean).map((value) => value!.startsWith('http') ? value! : `https://${value}`),
]

export const auth = betterAuth({
  database: pool,
  emailAndPassword: { enabled: true },
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL),
  trustedOrigins,
  ...(process.env.NODE_ENV === 'development' ? {
    advanced: {
      defaultCookieAttributes: { sameSite: 'none' as const, secure: true },
    },
  } : {}),
})
