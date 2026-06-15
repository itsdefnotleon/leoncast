'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toggleStation } from '@/lib/actions/stations'
import { usePlayer, type Track } from '@/components/player/player-provider'
import { StationDialog } from '@/components/stations/station-dialog'
import { StatCard } from '@/components/dashboard/stat-card'
import { NowPlayingCard } from '@/components/dashboard/now-playing-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDuration, DAYS } from '@/lib/format'
import {
  ArrowLeft,
  Radio,
  Headphones,
  Pencil,
  Music2,
  ListMusic,
  CalendarClock,
  Clock,
  Play,
  Globe,
  Lock,
} from 'lucide-react'

export type StationDetail = {
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
}

type Stats = {
  totalTracks: number
  librarySeconds: number
  totalPlaylists: number
  activeShows: number
}

type PlaylistRow = {
  id: number
  name: string
  type: string
  playMode: string
  trackCount: number
  isEnabled: boolean
}

type ScheduleRow = {
  id: number
  title: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isEnabled: boolean
  playlistName: string
}

type TrackRow = {
  id: number
  title: string
  artist: string | null
  duration: number
  playCount: number
}

export function StationDashboard({
  station,
  stats,
  playlists,
  schedules,
  trackRows,
  tracks,
}: {
  station: StationDetail
  stats: Stats
  playlists: PlaylistRow[]
  schedules: ScheduleRow[]
  trackRows: TrackRow[]
  tracks: Track[]
}) {
  const router = useRouter()
  const player = usePlayer()
  const [editOpen, setEditOpen] = useState(false)

  const isTuned = player.station?.id === station.id
  const libraryHours = Math.floor(stats.librarySeconds / 3600)
  const libraryMins = Math.floor((stats.librarySeconds % 3600) / 60)

  async function handleToggle(value: boolean) {
    await toggleStation(station.id, value)
    router.refresh()
  }

  function listen() {
    if (tracks.length === 0) return
    player.tuneIn(
      { id: station.id, name: station.name, shortcode: station.shortcode },
      tracks,
    )
  }

  function playTrack(index: number) {
    player.playQueue(tracks, index)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          href="/stations"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All stations
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <Radio className="size-7 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {station.name}
                </h1>
                <Badge variant={station.isEnabled ? 'default' : 'secondary'}>
                  <span
                    className={`mr-1 size-1.5 rounded-full ${
                      station.isEnabled
                        ? 'bg-primary-foreground'
                        : 'bg-muted-foreground'
                    }`}
                  />
                  {station.isEnabled ? 'On air' : 'Offline'}
                </Badge>
                <Badge variant="outline">
                  {station.isPublic ? (
                    <>
                      <Globe className="size-3" /> Public
                    </>
                  ) : (
                    <>
                      <Lock className="size-3" /> Private
                    </>
                  )}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {station.frequency ? `${station.frequency} · ` : ''}
                {station.genre ?? 'Various'} · @{station.shortcode}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
              <Switch
                checked={station.isEnabled}
                onCheckedChange={handleToggle}
                aria-label="Toggle station online"
              />
              <span className="text-xs text-muted-foreground">
                {station.isEnabled ? 'Online' : 'Offline'}
              </span>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              onClick={listen}
              disabled={tracks.length === 0 || !station.isEnabled}
              variant={isTuned ? 'default' : 'secondary'}
              className="font-semibold"
            >
              <Headphones className="size-4" />
              {isTuned ? 'Tuned in' : 'Listen'}
            </Button>
          </div>
        </div>

        {station.description ? (
          <p className="max-w-2xl text-sm text-muted-foreground">
            {station.description}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Media tracks"
          value={stats.totalTracks}
          sub="On this station"
          icon={Music2}
        />
        <StatCard
          label="Library length"
          value={`${libraryHours}h ${libraryMins}m`}
          sub="Total audio"
          icon={Clock}
        />
        <StatCard
          label="Playlists"
          value={stats.totalPlaylists}
          sub={`${stats.activeShows} scheduled shows`}
          icon={ListMusic}
        />
        <StatCard
          label="Listeners"
          value={station.listeners}
          sub={`Peak ${station.peakListeners}`}
          icon={Headphones}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <NowPlayingCard />

        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Schedule</h2>
          </div>
          {schedules.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No shows scheduled for this station yet.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {schedules.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {DAYS[s.dayOfWeek]} · {s.startTime}–{s.endTime} ·{' '}
                      {s.playlistName}
                    </p>
                  </div>
                  {!s.isEnabled ? (
                    <Badge variant="secondary">Paused</Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ListMusic className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Playlists</h2>
        </div>
        {playlists.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-sm font-medium">No playlists yet</p>
            <p className="text-sm text-muted-foreground">
              Create a playlist for this station to organize its tracks.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {playlists.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{p.name}</p>
                  {!p.isEnabled ? (
                    <Badge variant="secondary">Off</Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary">{p.trackCount} tracks</Badge>
                  <Badge variant="outline" className="capitalize">
                    {p.type}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {p.playMode}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Music2 className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Tracks</h2>
        </div>
        <Card className="overflow-hidden">
          {trackRows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm font-medium">No tracks assigned</p>
              <p className="text-sm text-muted-foreground">
                Assign media to this station from the{' '}
                <Link href="/media" className="underline">
                  Media Library
                </Link>
                .
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell text-right">
                    Duration
                  </TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    Plays
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackRows.map((t, i) => {
                  const isCurrent = player.current?.id === t.id
                  return (
                    <TableRow
                      key={t.id}
                      data-active={isCurrent}
                      className="data-[active=true]:bg-accent/5"
                    >
                      <TableCell>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-muted-foreground hover:text-accent"
                          onClick={() => playTrack(i)}
                          aria-label={`Play ${t.title}`}
                        >
                          <Play className="size-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span
                            data-active={isCurrent}
                            className="font-medium leading-tight data-[active=true]:text-accent"
                          >
                            {t.title}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {t.artist ?? 'Unknown Artist'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right tabular-nums text-muted-foreground">
                        {formatDuration(t.duration)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                        {t.playCount}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <StationDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        station={{
          id: station.id,
          name: station.name,
          shortcode: station.shortcode,
          description: station.description,
          genre: station.genre,
          frequency: station.frequency,
          isPublic: station.isPublic,
        }}
      />
    </div>
  )
}
