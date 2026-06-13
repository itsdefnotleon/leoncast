import { betterAuth } from 'better-auth'
import { Pool } from 'pg'

const v0RuntimeUrl = process.env.V0_RUNTIME_URL
const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined
const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined

const baseURL =
  process.env.BETTER_AUTH_URL ?? vercelProductionUrl ?? vercelUrl ?? v0RuntimeUrl

const trustedOrigins = [
  v0RuntimeUrl,
  vercelUrl,
  vercelProductionUrl,
  process.env.BETTER_AUTH_URL,
  // v0 preview iframes are served from these wildcard domains.
  'https://*.vusercontent.net',
  'https://*.v0.app',
  'https://*.vercel.app',
].filter((url): url is string => Boolean(url))

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: {
    enabled: true,
    // No public sign-ups: accounts are created by an admin only.
    disableSignUp: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'dj',
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    ...(process.env.NODE_ENV === 'development'
      ? { defaultCookieAttributes: { sameSite: 'none', secure: true } }
      : {}),
  },
})
