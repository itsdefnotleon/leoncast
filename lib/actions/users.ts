'use server'

import { auth } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { count, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

type CreateUserInput = {
  name: string
  email: string
  password: string
  role: 'admin' | 'dj'
}

/**
 * Creates a user account directly through Better Auth's internal adapter so it
 * works even though public sign-ups are disabled. Used for both the one-time
 * admin bootstrap and admin-managed account creation.
 */
async function createUserAccount({ name, email, password, role }: CreateUserInput) {
  const ctx = await auth.$context
  const hash = await ctx.password.hash(password)

  const created = await ctx.internalAdapter.createUser({
    name,
    email: email.toLowerCase(),
    emailVerified: true,
    role,
  })

  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: 'credential',
    accountId: created.id,
    password: hash,
  })

  return created
}

export async function getUserCount() {
  const [row] = await db.select({ value: count() }).from(user)
  return row?.value ?? 0
}

export async function bootstrapAdmin(input: {
  name: string
  email: string
  password: string
}) {
  const existing = await getUserCount()
  if (existing > 0) {
    return { error: 'Setup has already been completed.' }
  }
  if (input.password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  await createUserAccount({ ...input, role: 'admin' })
  return { success: true }
}

export async function listUsers() {
  const current = await getCurrentUser()
  if (!current || current.role !== 'admin') throw new Error('Unauthorized')
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt))
}

export async function createUser(input: CreateUserInput) {
  const current = await getCurrentUser()
  if (!current || current.role !== 'admin') throw new Error('Unauthorized')
  if (input.password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, input.email.toLowerCase()))
    .limit(1)
  if (existing.length > 0) {
    return { error: 'A user with that email already exists.' }
  }
  await createUserAccount(input)
  revalidatePath('/users')
  return { success: true }
}

export async function updateUserRole(id: string, role: 'admin' | 'dj') {
  const current = await getCurrentUser()
  if (!current || current.role !== 'admin') throw new Error('Unauthorized')
  await db.update(user).set({ role }).where(eq(user.id, id))
  revalidatePath('/users')
  return { success: true }
}

export async function deleteUser(id: string) {
  const current = await getCurrentUser()
  if (!current || current.role !== 'admin') throw new Error('Unauthorized')
  if (current.id === id) {
    return { error: 'You cannot delete your own account.' }
  }
  await db.delete(user).where(eq(user.id, id))
  revalidatePath('/users')
  return { success: true }
}
