"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UploadDialog } from "@/components/media/upload-dialog"
import { usePlayer, type Track } from "@/components/player/player-provider"
import { deleteMedia } from "@/lib/actions/media"
import { formatDuration, formatFileSize } from "@/lib/format"
import { Play, MoreVertical, Trash2, Search, Music, ListPlus, Upload } from "lucide-react"
import { toast } from "sonner"

export type MediaItem = {
  id: number
  title: string
  artist: string | null
  album: string | null
  genre: string | null
  duration: number
  fileSize: number
  playCount: number
  stationId: number | null
  streamUrl: string
}

type StationOption = { id: number; name: string }

export function MediaClient({
  media,
  stations,
}: {
  media: MediaItem[]
  stations: StationOption[]
}) {
  const router = useRouter()
  const player = usePlayer()
  const [query, setQuery] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)

  const filtered = media.filter((m) => {
    const q = query.toLowerCase()
    return (
      m.title.toLowerCase().includes(q) ||
      (m.artist ?? "").toLowerCase().includes(q) ||
      (m.album ?? "").toLowerCase().includes(q)
    )
  })

  function toTrack(m: MediaItem): Track {
    return {
      id: m.id,
      title: m.title,
      artist: m.artist ?? "Unknown Artist",
      duration: m.duration,
      url: m.streamUrl,
    }
  }

  function playNow(m: MediaItem) {
    player.playQueue(
      filtered.map(toTrack),
      filtered.findIndex((x) => x.id === m.id),
    )
  }

  function queueAll() {
    if (filtered.length === 0) return
    player.setQueue(filtered.map(toTrack))
    toast.success(`Queued ${filtered.length} tracks`)
  }

  async function handleDelete(id: number) {
    const res = await deleteMedia(id)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Track deleted")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks, artists, albums"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={queueAll} disabled={filtered.length === 0}>
            <ListPlus className="size-4" />
            Queue all
          </Button>
          <Button onClick={() => setUploadOpen(true)} className="font-semibold">
            <Upload className="size-4" />
            Upload
          </Button>
        </div>
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        stations={stations}
      />

      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Music className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No tracks found</p>
              <p className="text-sm text-muted-foreground">
                Upload audio files to build your media library.
              </p>
            </div>
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="size-4" />
              Upload media
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Album</TableHead>
                <TableHead className="hidden lg:table-cell">Genre</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Duration</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Size</TableHead>
                <TableHead className="hidden xl:table-cell text-right">Plays</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const isCurrent = player.current?.id === m.id
                return (
                  <TableRow key={m.id} data-active={isCurrent} className="data-[active=true]:bg-accent/5">
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-accent"
                        onClick={() => playNow(m)}
                        aria-label={`Play ${m.title}`}
                      >
                        <Play className="size-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className="font-medium leading-tight data-[active=true]:text-accent"
                          data-active={isCurrent}
                        >
                          {m.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {m.artist ?? "Unknown Artist"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {m.album ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {m.genre ? (
                        <Badge variant="secondary" className="font-normal">
                          {m.genre}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right tabular-nums text-muted-foreground">
                      {formatDuration(m.duration)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-right tabular-nums text-muted-foreground">
                      {formatFileSize(m.fileSize)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-right tabular-nums text-muted-foreground">
                      {m.playCount}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="size-8">
                            <MoreVertical className="size-4" />
                            <span className="sr-only">Track actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => playNow(m)}>
                            <Play className="size-4" />
                            Play now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(m.id)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
