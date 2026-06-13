"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getPlaylistTracks, setPlaylistTracks } from "@/lib/actions/playlists"
import { formatDuration } from "@/lib/format"
import { toast } from "sonner"

type MediaOption = {
  id: number
  title: string
  artist: string | null
  duration: number
}

export function TrackManagerDialog({
  playlistId,
  playlistName,
  media,
  open,
  onOpenChange,
}: {
  playlistId: number | null
  playlistName: string
  media: MediaOption[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && playlistId) {
      setLoading(true)
      getPlaylistTracks(playlistId)
        .then((tracks) => setSelected(tracks.map((t) => t.mediaId)))
        .finally(() => setLoading(false))
    }
  }, [open, playlistId])

  function toggle(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  async function handleSave() {
    if (!playlistId) return
    setSaving(true)
    const res = await setPlaylistTracks(playlistId, selected)
    setSaving(false)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Playlist updated")
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage tracks</DialogTitle>
          <DialogDescription>
            Choose which tracks belong to {playlistName}.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Loading tracks...
          </p>
        ) : media.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No media available. Upload tracks in the Media Library first.
          </p>
        ) : (
          <ScrollArea className="h-80 pr-3">
            <div className="flex flex-col gap-1">
              {media.map((m) => (
                <label
                  key={m.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                >
                  <Checkbox
                    checked={selected.includes(m.id)}
                    onCheckedChange={() => toggle(m.id)}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{m.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {m.artist ?? "Unknown Artist"}
                    </span>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatDuration(m.duration)}
                  </span>
                </label>
              ))}
            </div>
          </ScrollArea>
        )}
        <DialogFooter className="items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {selected.length} selected
          </span>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save tracks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
