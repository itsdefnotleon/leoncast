import { PageHeader } from "@/components/page-header"
import { ScheduleClient } from "@/components/schedule/schedule-client"
import { getSchedules } from "@/lib/actions/schedule"
import { getStations } from "@/lib/actions/stations"
import { getPlaylists } from "@/lib/actions/playlists"

export default async function SchedulePage() {
  const [schedules, stations, playlists] = await Promise.all([
    getSchedules(),
    getStations(),
    getPlaylists(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Schedule"
        description="Automate your weekly programming with recurring playlist slots."
      />
      <ScheduleClient
        schedules={schedules}
        stations={stations.map((s) => ({ id: s.id, name: s.name }))}
        playlists={playlists.map((p) => ({
          id: p.id,
          name: p.name,
          stationId: p.stationId,
        }))}
      />
    </div>
  )
}
