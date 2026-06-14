import { getCurrentUser } from '@/lib/auth-helpers'
import { getDashboardStats } from '@/lib/actions/stats'
import { getStationsWithCounts } from '@/lib/actions/stations'
import { getMedia } from '@/lib/actions/media'
import { PageHeader } from '@/components/page-header'
import { StatCard } from '@/components/dashboard/stat-card'
import { NowPlayingCard } from '@/components/dashboard/now-playing-card'
import { StationStatusList } from '@/components/dashboard/station-status-list'
import type { Track } from '@/components/player/player-provider'
import { Radio, Clock, Music2, ListMusic } from 'lucide-react'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const [stats, stations, allMedia] = await Promise.all([
    getDashboardStats(),
    getStationsWithCounts(),
    getMedia(),
  ])

  const tracksByStation: Record<number, Track[]> = {}
  for (const m of allMedia) {
    if (m.stationId == null) continue
    const track: Track = {
      id: m.id,
      title: m.title,
      artist: m.artist,
      url: m.url,
      duration: m.duration,
    }
    tracksByStation[m.stationId] ??= []
    tracksByStation[m.stationId].push(track)
  }

  const libraryHours = Math.floor(stats.librarySeconds / 3600)
  const libraryMins = Math.floor((stats.librarySeconds % 3600) / 60)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'DJ'}`}
        description="Live overview of your broadcast network."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Stations online"
          value={`${stats.onlineStations}/${stats.totalStations}`}
          sub="Active broadcasts"
          icon={Radio}
        />
        <StatCard
          label="Media tracks"
          value={stats.totalTracks}
          sub="In your library"
          icon={Music2}
        />
        <StatCard
          label="Library length"
          value={`${libraryHours}h ${libraryMins}m`}
          sub="Total audio"
          icon={Clock}
        />
        <StatCard
          label="Playlists"
          value={stats.totalPlaylists}
          sub={`${stats.activeShows} scheduled shows`}
          icon={ListMusic}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NowPlayingCard />
        <StationStatusList
          stations={stations.map((s) => ({
            id: s.id,
            name: s.name,
            shortcode: s.shortcode,
            genre: s.genre,
            isEnabled: s.isEnabled,
            trackCount: s.trackCount,
          }))}
          tracksByStation={tracksByStation}
        />
      </div>
    </div>
  )
}
