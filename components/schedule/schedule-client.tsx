"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ScheduleDialog } from "@/components/schedule/schedule-dialog"
import { toggleSchedule, deleteSchedule } from "@/lib/actions/schedule"
import { DAYS } from "@/lib/format"
import { Clock, Trash2, CalendarDays, Radio } from "lucide-react"
import { toast } from "sonner"

type ScheduleItem = {
  id: number
  title: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
  stationId: number
  playlistId: number
  stationName: string
  playlistName: string
}

type StationOption = { id: number; name: string }
type PlaylistOption = { id: number; name: string; stationId: number }

export function ScheduleClient({
  schedules,
  stations,
  playlists,
}: {
  schedules: ScheduleItem[]
  stations: StationOption[]
  playlists: PlaylistOption[]
}) {
  const router = useRouter()

  async function handleToggle(id: number, value: boolean) {
    await toggleSchedule(id, value)
    router.refresh()
  }

  async function handleDelete(id: number) {
    const res = await deleteSchedule(id)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Slot removed")
    router.refresh()
  }

  const todayIndex = new Date().getDay()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <ScheduleDialog stations={stations} playlists={playlists} />
      </div>

      {schedules.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <CalendarDays className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Nothing scheduled</p>
            <p className="text-sm text-muted-foreground">
              Add a slot to automate what plays and when.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day, dayIndex) => {
            const items = schedules.filter((s) => s.dayOfWeek === dayIndex)
            const isToday = dayIndex === todayIndex
            return (
              <Card
                key={day}
                data-today={isToday}
                className="flex flex-col gap-3 p-4 data-[today=true]:border-accent/50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{day}</h3>
                  {isToday && (
                    <Badge className="bg-accent text-accent-foreground">Today</Badge>
                  )}
                </div>
                {items.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No shows scheduled
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {items.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium leading-tight">{s.title}</p>
                            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              <span className="tabular-nums">
                                {s.startTime} – {s.endTime}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(s.id)}
                            aria-label="Remove slot"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                            <Radio className="size-3 shrink-0" />
                            <span className="truncate">
                              {s.stationName} · {s.playlistName}
                            </span>
                          </div>
                          <Switch
                            checked={s.isEnabled}
                            onCheckedChange={(v) => handleToggle(s.id, v)}
                            aria-label="Toggle slot"
                            className="scale-90"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
