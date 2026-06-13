'use server'

import { getUserId } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { media, playlist, playlistTrack, schedule } from '@/lib/db/schema'
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getPlaylists(stationId?: number) {
  const userId = await getUserId()
  const where =
    stationId !== undefined
      ? and(eq(playlist.userId, userId), eq(playlist.stationId, stationId))
      : eq(playlist.userId, userId)
  const lists = await db
    .select()
    .from(playlist)
    .where(where)
    .orderBy(desc(playlist.createdAt))

  const result = []
  for (const list of lists) {
    const [tracks] = await db
      .select({ value: sql<number>`count(*)::int` })
      .from(playlistTrack)
      .where(
        and(
          eq(playlistTrack.playlistId, list.id),
          eq(playlistTrack.userId, userId),
        ),
      )
    result.push({ ...list, trackCount: tracks?.value ?? 0 })
  }
  return result
}

export async function getPlaylistTracks(playlistId: number) {
  const userId = await getUserId()
  return db
    .select({
      id: playlistTrack.id,
      position: playlistTrack.position,
      mediaId: media.id,
      title: media.title,
      artist: media.artist,
      duration: media.duration,
      url: media.url,
    })
    .from(playlistTrack)
    .innerJoin(media, eq(playlistTrack.mediaId, media.id))
    .where(
      and(
        eq(playlistTrack.playlistId, playlistId),
        eq(playlistTrack.userId, userId),
      ),
    )
    .orderBy(asc(playlistTrack.position))
}

export async function createPlaylist(input: {
  name: string
  stationId: number
  type: string
  playMode: string
  weight: number
}) {
  const userId = await getUserId()
  await db.insert(playlist).values({
    userId,
    stationId: input.stationId,
    name: input.name,
    type: input.type,
    playMode: input.playMode,
    weight: input.weight,
  })
  revalidatePath('/playlists')
  return { success: true }
}

export async function togglePlaylist(id: number, isEnabled: boolean) {
  const userId = await getUserId()
  await db
    .update(playlist)
    .set({ isEnabled })
    .where(and(eq(playlist.id, id), eq(playlist.userId, userId)))
  revalidatePath('/playlists')
  return { success: true }
}

export async function deletePlaylist(id: number) {
  const userId = await getUserId()
  await db
    .delete(playlistTrack)
    .where(and(eq(playlistTrack.playlistId, id), eq(playlistTrack.userId, userId)))
  await db
    .delete(schedule)
    .where(and(eq(schedule.playlistId, id), eq(schedule.userId, userId)))
  await db
    .delete(playlist)
    .where(and(eq(playlist.id, id), eq(playlist.userId, userId)))
  revalidatePath('/playlists')
  return { success: true }
}

export async function setPlaylistTracks(playlistId: number, mediaIds: number[]) {
  const userId = await getUserId()
  await db
    .delete(playlistTrack)
    .where(
      and(
        eq(playlistTrack.playlistId, playlistId),
        eq(playlistTrack.userId, userId),
      ),
    )
  if (mediaIds.length > 0) {
    // Confirm the media belongs to this user before inserting.
    const owned = await db
      .select({ id: media.id })
      .from(media)
      .where(and(eq(media.userId, userId), inArray(media.id, mediaIds)))
    const ownedIds = new Set(owned.map((m) => m.id))
    const values = mediaIds
      .filter((id) => ownedIds.has(id))
      .map((mediaId, index) => ({
        userId,
        playlistId,
        mediaId,
        position: index,
      }))
    if (values.length > 0) {
      await db.insert(playlistTrack).values(values)
    }
  }
  revalidatePath('/playlists')
  return { success: true }
}
