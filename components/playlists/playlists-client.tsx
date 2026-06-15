"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlaylistDialog } from "@/components/playlists/playlist-dialog"
import { TrackManagerDialog } from "@/components/playlists/track-manager-dialog"
import { togglePlaylist, deletePlaylist } from "@/lib/actions/playlists"
import { ListMusic, MoreVertical, Trash2, Pencil, Shuffle, ArrowDownUp, Dices } from "lucide-react"
import { toast } from "sonner"

type Playlist = {
  id: number
  name: string
  type: string
  playMode: string
  weight: number
  isEnabled: boolean
  stationId: number
  trackCount: number
}

type StationOption = { id: number; name: string }
type MediaOption = { id: number; title: string; artist: string | null; duration: number }

const MODE_ICON: Record<string, typeof Shuffle> = {
  shuffle: Shuffle,
  sequential: ArrowDownUp,
  random: Dices,
}

export function PlaylistsClient({
  playlists,
  stations,
  media,
}: {
  playlists: Playlist[]
  stations: StationOption[]
  media: MediaOption[]
}) {
  const router = useRouter()
  const [managing, setManaging] = useState<Playlist | null>(null)

  const stationName = (id: number) => stations.find((s) => s.id === id)?.name ?? "—"

  async function handleToggle(id: number, value: boolean) {
    await togglePlaylist(id, value)
    router.refresh()
  }

  async function handleDelete(id: number) {
    const res = await deletePlaylist(id)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Playlist deleted")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <PlaylistDialog stations={stations} />
      </div>

      {playlists.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ListMusic className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No playlists yet</p>
            <p className="text-sm text-muted-foreground">
              Create a playlist to organize your rotation.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((pl) => {
            const ModeIcon = MODE_ICON[pl.playMode] ?? Shuffle
            return (
              <Card key={pl.id} className="flex flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                      <ListMusic className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{pl.name}</p>
                      <p className="text-xs text-muted-foreground">{stationName(pl.stationId)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button type="button" className="inline-flex items-center justify-center rounded-md hover:bg-accent p-2 transition-colors size-8" aria-label="Playlist actions">
                        <MoreVertical className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setManaging(pl)}>
                        <Pencil className="size-4" />
                        Manage tracks
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => handleDelete(pl.id)}>
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="font-normal capitalize">
                    {pl.type}
                  </Badge>
                  <Badge variant="outline" className="gap-1 font-normal capitalize">
                    <ModeIcon className="size-3" />
                    {pl.playMode}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    Weight {pl.weight}
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-sm text-muted-foreground">
                    {pl.trackCount} track{pl.trackCount === 1 ? "" : "s"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {pl.isEnabled ? "On air" : "Disabled"}
                    </span>
                    <Switch
                      checked={pl.isEnabled}
                      onCheckedChange={(v) => handleToggle(pl.id, v)}
                      aria-label="Toggle playlist"
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <TrackManagerDialog
        playlistId={managing?.id ?? null}
        playlistName={managing?.name ?? ""}
        media={media}
        open={managing !== null}
        onOpenChange={(open) => !open && setManaging(null)}
      />
    </div>
  )
}
