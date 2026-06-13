import { PageHeader } from "@/components/page-header"
import { MediaClient } from "@/components/media/media-client"
import { getMedia } from "@/lib/actions/media"
import { getStations } from "@/lib/actions/stations"

export default async function MediaPage() {
  const [media, stations] = await Promise.all([getMedia(), getStations()])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Media Library"
        description="Upload and manage the audio that powers your stations."
      />
      <MediaClient
        media={media}
        stations={stations.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  )
}
