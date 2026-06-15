'use server'

import { getUserId } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { media, playlist, schedule, station } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'

export async function getDashboardStats() {
  const userId = await getUserId()

  const [stationStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      online: sql<number>`count(*) filter (where "isEnabled" = true)::int`,
    })
    .from(station)
    .where(eq(station.userId, userId))

  const [mediaStats] = await db
    .select({
      tracks: sql<number>`count(*)::int`,
      seconds: sql<number>`coalesce(sum("duration"), 0)::int`,
    })
    .from(media)
    .where(eq(media.userId, userId))

  const [playlistStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(playlist)
    .where(eq(playlist.userId, userId))

  const [scheduleStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(schedule)
    .where(and(eq(schedule.userId, userId), eq(schedule.isEnabled, true)))

  return {
    totalStations: stationStats?.total ?? 0,
    onlineStations: stationStats?.online ?? 0,
    totalTracks: mediaStats?.tracks ?? 0,
    librarySeconds: mediaStats?.seconds ?? 0,
    totalPlaylists: playlistStats?.total ?? 0,
    activeShows: scheduleStats?.total ?? 0,
  }
}

export async function getStationStats(stationId: number) {
  const userId = await getUserId()

  const [mediaStats] = await db
    .select({
      tracks: sql<number>`count(*)::int`,
      seconds: sql<number>`coalesce(sum("duration"), 0)::int`,
    })
    .from(media)
    .where(and(eq(media.userId, userId), eq(media.stationId, stationId)))

  const [playlistStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(playlist)
    .where(and(eq(playlist.userId, userId), eq(playlist.stationId, stationId)))

  const [scheduleStats] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(schedule)
    .where(
      and(
        eq(schedule.userId, userId),
        eq(schedule.stationId, stationId),
        eq(schedule.isEnabled, true),
      ),
    )

  return {
    totalTracks: mediaStats?.tracks ?? 0,
    librarySeconds: mediaStats?.seconds ?? 0,
    totalPlaylists: playlistStats?.total ?? 0,
    activeShows: scheduleStats?.total ?? 0,
  }
}
