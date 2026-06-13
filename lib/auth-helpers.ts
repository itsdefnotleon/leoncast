import 'server-only'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function requireUser() {
  const session = await getSession()
  if (!session?.user) redirect('/sign-in')
  return session.user
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session?.user) return null
  const rows = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1)
  return rows[0] ?? null
}

export async function requireAdmin() {
  const current = await getCurrentUser()
  if (!current) redirect('/sign-in')
  if (current.role !== 'admin') redirect('/')
  return current
}
