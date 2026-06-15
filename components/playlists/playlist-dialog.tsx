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
import { Slider } from "@/components/ui/slider"
import { createPlaylist } from "@/lib/actions/playlists"
import { Plus } from "lucide-react"
import { toast } from "sonner"

type StationOption = { id: number; name: string }

export function PlaylistDialog({ stations }: { stations: StationOption[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [stationId, setStationId] = useState<string>(
    stations[0] ? String(stations[0].id) : "",
  )
  const [type, setType] = useState("general")
  const [playMode, setPlayMode] = useState("shuffle")
  const [weight, setWeight] = useState(3)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stationId) {
      toast.error("Create a station first")
      return
    }
    setLoading(true)
    const res = await createPlaylist({
      name,
      stationId: Number(stationId),
      type,
      playMode,
      weight,
    })
    setLoading(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Playlist created")
    setOpen(false)
    setName("")
    setWeight(3)
    setPlayMode("shuffle")
    setType("general")
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors">
          <Plus className="size-4 mr-2" />
          New playlist
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create playlist</DialogTitle>
          <DialogDescription>
            Group tracks and control how they rotate on air.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pl-name">Name</Label>
            <Input
              id="pl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Late Night Drive"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pl-station">Station</Label>
            <Select value={stationId} onValueChange={setStationId}>
              <SelectTrigger id="pl-station">
                <SelectValue placeholder="Select station" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pl-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="pl-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Rotation</SelectItem>
                  <SelectItem value="jingle">Jingles</SelectItem>
                  <SelectItem value="advert">Advertisements</SelectItem>
                  <SelectItem value="once">Play Once Per Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pl-mode">Play mode</Label>
              <Select value={playMode} onValueChange={setPlayMode}>
                <SelectTrigger id="pl-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shuffle">Shuffle</SelectItem>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="pl-weight">Weight</Label>
              <span className="text-sm tabular-nums text-muted-foreground">{weight}</span>
            </div>
            <Slider
              id="pl-weight"
              min={1}
              max={10}
              step={1}
              value={[weight]}
              onValueChange={(v) => setWeight(v[0])}
            />
            <p className="text-xs text-muted-foreground">
              Higher weight plays more often relative to other playlists.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create playlist"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
