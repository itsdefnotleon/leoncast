'use server'

import { getUserId } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { media, playlist, schedule, station } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getStations() {
  const userId = await getUserId()
  return db
    .select()
    .from(station)
    .where(eq(station.userId, userId))
    .orderBy(desc(station.createdAt))
}

export async function getStation(id: number) {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(station)
    .where(and(eq(station.id, id), eq(station.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function getStationsWithCounts() {
  const userId = await getUserId()
  const stations = await getStations()
  const result = []
  for (const s of stations) {
    const [tracks] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(media)
      .where(and(eq(media.stationId, s.id), eq(media.userId, userId)))
    const [lists] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(playlist)
      .where(and(eq(playlist.stationId, s.id), eq(playlist.userId, userId)))
    result.push({
      ...s,
      trackCount: tracks?.value ?? 0,
      playlistCount: lists?.value ?? 0,
    })
  }
  return result
}

export async function createStation(input: {
  name: string
  shortcode: string
  description?: string
  genre?: string
  frequency?: string
  isPublic: boolean
}) {
  const userId = await getUserId()
  await db.insert(station).values({
    userId,
    name: input.name,
    shortcode: input.shortcode,
    description: input.description || null,
    genre: input.genre || null,
    frequency: input.frequency || null,
    isPublic: input.isPublic,
    listeners: Math.floor(Math.random() * 40),
    peakListeners: Math.floor(Math.random() * 120) + 40,
  })
  revalidatePath('/stations')
  revalidatePath('/')
  return { success: true }
}

export async function updateStation(
  id: number,
  input: {
    name: string
    shortcode: string
    description?: string
    genre?: string
    frequency?: string
    isPublic: boolean
  },
) {
  const userId = await getUserId()
  await db
    .update(station)
    .set({
      name: input.name,
      shortcode: input.shortcode,
      description: input.description || null,
      genre: input.genre || null,
      frequency: input.frequency || null,
      isPublic: input.isPublic,
      updatedAt: new Date(),
    })
    .where(and(eq(station.id, id), eq(station.userId, userId)))
  revalidatePath('/stations')
  return { success: true }
}

export async function toggleStation(id: number, isEnabled: boolean) {
  const userId = await getUserId()
  await db
    .update(station)
    .set({ isEnabled, updatedAt: new Date() })
    .where(and(eq(station.id, id), eq(station.userId, userId)))
  revalidatePath('/stations')
  revalidatePath('/')
  return { success: true }
}

export async function deleteStation(id: number) {
  const userId = await getUserId()
  await db
    .delete(station)
    .where(and(eq(station.id, id), eq(station.userId, userId)))
  // Clean up related records scoped to this user.
  await db
    .delete(schedule)
    .where(and(eq(schedule.stationId, id), eq(schedule.userId, userId)))
  await db
    .delete(playlist)
    .where(and(eq(playlist.stationId, id), eq(playlist.userId, userId)))
  revalidatePath('/stations')
  revalidatePath('/')
  return { success: true }
}
