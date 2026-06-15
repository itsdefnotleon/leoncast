import { getStationsWithCounts } from '@/lib/actions/stations'
import { getMedia } from '@/lib/actions/media'
import { PageHeader } from '@/components/page-header'
import { StationsClient } from '@/components/stations/stations-client'
import type { Track } from '@/components/player/player-provider'

export default async function StationsPage() {
  const [stations, allMedia] = await Promise.all([
    getStationsWithCounts(),
    getMedia(),
  ])

  const tracksByStation: Record<number, Track[]> = {}
  for (const m of allMedia) {
    if (m.stationId == null) continue
    tracksByStation[m.stationId] ??= []
    tracksByStation[m.stationId].push({
      id: m.id,
      title: m.title,
      artist: m.artist,
      url: m.streamUrl,
      duration: m.duration,
    })
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Stations"
        description="Manage the broadcast channels in your network."
      />
      <StationsClient stations={stations} tracksByStation={tracksByStation} />
    </div>
  )
}
