'use server'

import { getUserId } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { playlist, schedule, station } from '@/lib/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getSchedules() {
  const userId = await getUserId()
  return db
    .select({
      id: schedule.id,
      title: schedule.title,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isEnabled: schedule.isEnabled,
      stationId: schedule.stationId,
      playlistId: schedule.playlistId,
      stationName: station.name,
      playlistName: playlist.name,
    })
    .from(schedule)
    .innerJoin(station, eq(schedule.stationId, station.id))
    .innerJoin(playlist, eq(schedule.playlistId, playlist.id))
    .where(eq(schedule.userId, userId))
    .orderBy(asc(schedule.dayOfWeek), asc(schedule.startTime))
}

export async function createSchedule(input: {
  title: string
  stationId: number
  playlistId: number
  dayOfWeek: number
  startTime: string
  endTime: string
}) {
  const userId = await getUserId()
  await db.insert(schedule).values({
    userId,
    title: input.title,
    stationId: input.stationId,
    playlistId: input.playlistId,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
  })
  revalidatePath('/schedule')
  return { success: true }
}

export async function toggleSchedule(id: number, isEnabled: boolean) {
  const userId = await getUserId()
  await db
    .update(schedule)
    .set({ isEnabled })
    .where(and(eq(schedule.id, id), eq(schedule.userId, userId)))
  revalidatePath('/schedule')
  return { success: true }
}

export async function deleteSchedule(id: number) {
  const userId = await getUserId()
  await db
    .delete(schedule)
    .where(and(eq(schedule.id, id), eq(schedule.userId, userId)))
  revalidatePath('/schedule')
  return { success: true }
}
