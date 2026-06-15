'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  deleteStation,
  toggleStation,
} from '@/lib/actions/stations'
import { usePlayer, type Track } from '@/components/player/player-provider'
import { StationDialog } from '@/components/stations/station-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreVertical,
  Headphones,
  Plus,
  Radio,
  Pencil,
  Trash2,
  LayoutDashboard,
} from 'lucide-react'
import { toast } from 'sonner'

type StationRow = {
  id: number
  name: string
  shortcode: string
  description: string | null
  genre: string | null
  frequency: string | null
  isPublic: boolean
  isEnabled: boolean
  listeners: number
  peakListeners: number
  trackCount: number
  playlistCount: number
}

export function StationsClient({
  stations,
  tracksByStation,
}: {
  stations: StationRow[]
  tracksByStation: Record<number, Track[]>
}) {
  const router = useRouter()
  const { tuneIn, station: tuned } = usePlayer()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<StationRow | undefined>()

  function openCreate() {
    setEditing(undefined)
    setDialogOpen(true)
  }

  function openEdit(station: StationRow) {
    setEditing(station)
    setDialogOpen(true)
  }

  async function handleToggle(id: number, value: boolean) {
    await toggleStation(id, value)
    router.refresh()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this station and its playlists and schedules?')) return
    await deleteStation(id)
    toast.success('Station deleted.')
    router.refresh()
  }

  return (
    <>
      <div className="flex justify-end px-6 pt-2">
        <Button onClick={openCreate} className="font-semibold">
          <Plus className="size-4" />
          New station
        </Button>
      </div>

      <div className="p-6 pt-4">
        {stations.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Radio className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No stations yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first station to start building your network.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              New station
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stations.map((s) => {
              const tracks = tracksByStation[s.id] ?? []
              return (
                <div
                  key={s.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/stations/${s.id}`}
                      className="group flex min-w-0 items-center gap-3"
                    >
                      <div className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                        <Radio className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold transition-colors group-hover:text-primary">
                          {s.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.frequency ? `${s.frequency} · ` : ''}
                          {s.genre ?? 'Various'}
                        </p>
                      </div>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                          <span className="sr-only">Station options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/stations/${s.id}`)}
                        >
                          <LayoutDashboard className="size-4" />
                          Open dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(s)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleDelete(s.id)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {s.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {s.description}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{s.trackCount} tracks</Badge>
                    <Badge variant="secondary">
                      {s.playlistCount} playlists
                    </Badge>
                    {s.isPublic ? (
                      <Badge variant="outline">Public</Badge>
                    ) : (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={s.isEnabled}
                        onCheckedChange={(v) => handleToggle(s.id, v)}
                        aria-label="Toggle station online"
                      />
                      <span className="text-xs text-muted-foreground">
                        {s.isEnabled ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant={tuned?.id === s.id ? 'default' : 'secondary'}
                      disabled={tracks.length === 0 || !s.isEnabled}
                      onClick={() =>
                        tuneIn(
                          { id: s.id, name: s.name, shortcode: s.shortcode },
                          tracks,
                        )
                      }
                    >
                      <Headphones className="size-3.5" />
                      {tuned?.id === s.id ? 'Tuned in' : 'Listen'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <StationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        station={editing}
      />
    </>
  )
}
