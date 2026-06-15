'use client'

import { usePlayer } from '@/components/player/player-provider'
import { formatDuration } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Pause, Play, Radio, Square } from 'lucide-react'

function Equalizer({ active }: { active: boolean }) {
  return (
    <div className="flex h-5 items-end gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`w-1 rounded-full bg-primary ${
            active ? 'animate-equalize' : ''
          }`}
          style={{
            height: '100%',
            animationDelay: `${i * 0.12}s`,
            transform: active ? undefined : 'scaleY(0.3)',
          }}
        />
      ))}
    </div>
  )
}

export function NowPlayingCard() {
  const { station, current, isPlaying, progress, duration, isLive, isActive, togglePlay, stop } =
    usePlayer()
  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            <span
              className={`absolute inline-flex size-full rounded-full ${
                isPlaying ? 'animate-ping bg-primary/70' : 'bg-muted-foreground/40'
              }`}
            />
            <span
              className={`relative inline-flex size-2.5 rounded-full ${
                isPlaying ? 'bg-primary' : 'bg-muted-foreground'
              }`}
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isActive
              ? isPlaying
                ? isLive
                  ? 'On Air'
                  : 'Playing'
                : 'Paused'
              : 'Off Air'}
          </span>
        </div>
        <Equalizer active={isPlaying} />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Radio className="size-8 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">
            {current ? current.title : 'No station tuned in'}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {isActive
              ? isLive
                ? `${current?.artist ?? 'Unknown artist'} · ${station?.name}`
                : (current?.artist ?? 'Unknown artist')
              : 'Tune into a station below to listen live'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={!isActive}
            className="size-12 rounded-full"
            aria-label={isPlaying ? 'Pause' : 'Resume live'}
          >
            {isPlaying ? <Pause className="size-5" /> : <Play className="size-5" />}
          </Button>
          {isActive ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={stop}
              className="size-10"
              aria-label="Stop listening"
            >
              <Square className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{formatDuration(progress)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
    </div>
  )
}
