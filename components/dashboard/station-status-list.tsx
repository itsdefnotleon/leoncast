'use client'

import Link from 'next/link'
import { usePlayer, type Track } from '@/components/player/player-provider'
import { Button } from '@/components/ui/button'
import { Radio, Headphones } from 'lucide-react'

type StationRow = {
  id: number
  name: string
  shortcode: string
  genre: string | null
  isEnabled: boolean
  trackCount: number
}

export function StationStatusList({
  stations,
  tracksByStation,
}: {
  stations: StationRow[]
  tracksByStation: Record<number, Track[]>
}) {
  const { tuneIn, station: tuned } = usePlayer()

  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <Radio className="size-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">No stations yet</p>
          <p className="text-xs text-muted-foreground">
            Create your first station to start broadcasting.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/stations">Create station</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold">Stations</h2>
      <ul className="flex flex-col divide-y divide-border">
        {stations.map((s) => {
          const tracks = tracksByStation[s.id] ?? []
          const isTuned = tuned?.id === s.id
          return (
            <li
              key={s.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                className={`size-2.5 shrink-0 rounded-full ${
                  s.isEnabled ? 'bg-primary' : 'bg-muted-foreground/40'
                }`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.genre ?? 'Various'} · {s.trackCount} tracks ·{' '}
                  {s.isEnabled ? 'On air' : 'Offline'}
                </p>
              </div>
              <Button
                variant={isTuned ? 'default' : 'secondary'}
                size="sm"
                disabled={tracks.length === 0 || !s.isEnabled}
                onClick={() =>
                  tuneIn(
                    { id: s.id, name: s.name, shortcode: s.shortcode },
                    tracks,
                  )
                }
              >
                <Headphones className="size-3.5" />
                {isTuned ? 'Tuned in' : 'Listen'}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
