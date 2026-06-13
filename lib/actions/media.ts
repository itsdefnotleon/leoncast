'use server'

import { del } from '@vercel/blob'
import { getUserId } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { media, playlistTrack } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getMedia(stationId?: number) {
  const userId = await getUserId()
  const where =
    stationId !== undefined
      ? and(eq(media.userId, userId), eq(media.stationId, stationId))
      : eq(media.userId, userId)
  return db.select().from(media).where(where).orderBy(desc(media.createdAt))
}

export async function createMedia(input: {
  title: string
  artist?: string
  album?: string
  genre?: string
  duration: number
  pathname: string
  fileSize: number
  stationId?: number
}) {
  const userId = await getUserId()
  await db.insert(media).values({
    userId,
    stationId: input.stationId ?? null,
    title: input.title,
    artist: input.artist || null,
    album: input.album || null,
    genre: input.genre || null,
    duration: input.duration,
    url: input.pathname,
    fileSize: input.fileSize,
  })
  revalidatePath('/media')
  revalidatePath('/')
  return { success: true }
}

export async function updateMedia(
  id: number,
  input: {
    title: string
    artist?: string
    album?: string
    genre?: string
    stationId?: number
  },
) {
  const userId = await getUserId()
  await db
    .update(media)
    .set({
      title: input.title,
      artist: input.artist || null,
      album: input.album || null,
      genre: input.genre || null,
      stationId: input.stationId ?? null,
    })
    .where(and(eq(media.id, id), eq(media.userId, userId)))
  revalidatePath('/media')
  return { success: true }
}

export async function deleteMedia(id: number) {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(media)
    .where(and(eq(media.id, id), eq(media.userId, userId)))
    .limit(1)
  const item = rows[0]
  if (item) {
    try {
      await del(item.url)
    } catch (error) {
      console.error('[v0] Blob delete error:', error)
    }
  }
  await db
    .delete(playlistTrack)
    .where(and(eq(playlistTrack.mediaId, id), eq(playlistTrack.userId, userId)))
  await db.delete(media).where(and(eq(media.id, id), eq(media.userId, userId)))
  revalidatePath('/media')
  revalidatePath('/')
  return { success: true }
}
