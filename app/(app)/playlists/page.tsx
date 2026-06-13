import { PageHeader } from "@/components/page-header"
import { PlaylistsClient } from "@/components/playlists/playlists-client"
import { getPlaylists } from "@/lib/actions/playlists"
import { getStations } from "@/lib/actions/stations"
import { getMedia } from "@/lib/actions/media"

export default async function PlaylistsPage() {
  const [playlists, stations, media] = await Promise.all([
    getPlaylists(),
    getStations(),
    getMedia(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Playlists"
        description="Organize tracks into rotations and control how they play."
      />
      <PlaylistsClient
        playlists={playlists}
        stations={stations.map((s) => ({ id: s.id, name: s.name }))}
        media={media.map((m) => ({
          id: m.id,
          title: m.title,
          artist: m.artist,
          duration: m.duration,
        }))}
      />
    </div>
  )
}
