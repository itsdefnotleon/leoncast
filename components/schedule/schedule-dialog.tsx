"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSchedule } from "@/lib/actions/schedule"
import { DAYS } from "@/lib/format"
import { Plus } from "lucide-react"
import { toast } from "sonner"

type StationOption = { id: number; name: string }
type PlaylistOption = { id: number; name: string; stationId: number }

export function ScheduleDialog({
  stations,
  playlists,
}: {
  stations: StationOption[]
  playlists: PlaylistOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [stationId, setStationId] = useState(stations[0] ? String(stations[0].id) : "")
  const [playlistId, setPlaylistId] = useState("")
  const [dayOfWeek, setDayOfWeek] = useState("1")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("12:00")

  const stationPlaylists = playlists.filter((p) => String(p.stationId) === stationId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stationId || !playlistId) {
      toast.error("Select a station and playlist")
      return
    }
    if (startTime >= endTime) {
      toast.error("End time must be after start time")
      return
    }
    setLoading(true)
    const res = await createSchedule({
      title,
      stationId: Number(stationId),
      playlistId: Number(playlistId),
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
    })
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Schedule slot added")
    setOpen(false)
    setTitle("")
    setPlaylistId("")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={stations.length === 0 || playlists.length === 0}>
          <Plus className="size-4" />
          Add slot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule a show</DialogTitle>
          <DialogDescription>
            Assign a playlist to a recurring weekly time slot.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sc-title">Show title</Label>
            <Input
              id="sc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Morning Show"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sc-station">Station</Label>
              <Select
                value={stationId}
                onValueChange={(v) => {
                  setStationId(v)
                  setPlaylistId("")
                }}
              >
                <SelectTrigger id="sc-station">
                  <SelectValue placeholder="Station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sc-playlist">Playlist</Label>
              <Select value={playlistId} onValueChange={setPlaylistId}>
                <SelectTrigger id="sc-playlist">
                  <SelectValue placeholder="Playlist" />
                </SelectTrigger>
                <SelectContent>
                  {stationPlaylists.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No playlists for this station
                    </SelectItem>
                  ) : (
                    stationPlaylists.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sc-day">Day of week</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger id="sc-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((d, i) => (
                  <SelectItem key={d} value={String(i)}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sc-start">Start time</Label>
              <Input
                id="sc-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sc-end">End time</Label>
              <Input
                id="sc-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add to schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
