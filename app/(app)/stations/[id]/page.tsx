import { notFound } from 'next/navigation'
import { getStation } from '@/lib/actions/stations'
import { getStationStats } from '@/lib/actions/stats'
import { getMedia } from '@/lib/actions/media'
import { getPlaylists } from '@/lib/actions/playlists'
import { getSchedules } from '@/lib/actions/schedule'
import { StationDashboard } from '@/components/stations/station-dashboard'
import type { Track } from '@/components/player/player-provider'

export default async function StationDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const stationId = Number(id)
  if (!Number.isInteger(stationId)) notFound()

  const station = await getStation(stationId)
  if (!station) notFound()

  const [stats, mediaItems, playlists, schedules] = await Promise.all([
    getStationStats(stationId),
    getMedia(stationId),
    getPlaylists(stationId),
    getSchedules(stationId),
  ])

  const tracks: Track[] = mediaItems.map((m) => ({
    id: m.id,
    title: m.title,
    artist: m.artist,
    url: m.streamUrl,
    duration: m.duration,
  }))

  const trackRows = mediaItems.map((m) => ({
    id: m.id,
    title: m.title,
    artist: m.artist,
    duration: m.duration,
    playCount: m.playCount,
  }))

  return (
    <StationDashboard
      station={{
        id: station.id,
        name: station.name,
        shortcode: station.shortcode,
        description: station.description,
        genre: station.genre,
        frequency: station.frequency,
        isPublic: station.isPublic,
        isEnabled: station.isEnabled,
        listeners: station.listeners,
        peakListeners: station.peakListeners,
      }}
      stats={stats}
      playlists={playlists.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        playMode: p.playMode,
        trackCount: p.trackCount,
        isEnabled: p.isEnabled,
      }))}
      schedules={schedules.map((s) => ({
        id: s.id,
        title: s.title,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isEnabled: s.isEnabled,
        playlistName: s.playlistName,
      }))}
      trackRows={trackRows}
      tracks={tracks}
    />
  )
}
