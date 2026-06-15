'use client'

import { usePlayer } from '@/components/player/player-provider'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatDuration } from '@/lib/format'
import { Pause, Play, Square, Volume2, Radio } from 'lucide-react'

export function PlayerBar() {
  const {
    station,
    current,
    isPlaying,
    progress,
    duration,
    volume,
    isLive,
    isActive,
    togglePlay,
    stop,
    setVolume,
  } = usePlayer()

  const pct = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0

  return (
    <div className="flex h-20 shrink-0 items-center gap-4 border-t border-border bg-card px-4 sm:px-6">
      {/* Station / track info */}
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:w-72 sm:flex-none">
        <div className="relative flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary">
          <Radio className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                <span
                  className={`size-1.5 rounded-full bg-primary-foreground ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                />
                Live
              </span>
            ) : null}
            <p className="truncate text-sm font-medium">
              {current ? current.title : 'Not tuned in'}
            </p>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {isActive
              ? isLive
                ? `${current?.artist ?? 'Unknown artist'} · ${station?.name}`
                : (current?.artist ?? 'Unknown artist')
              : 'Tune into a station to start listening'}
          </p>
        </div>
      </div>

      {/* Transport */}
      <div className="flex flex-[2] flex-col items-center gap-1.5">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={!isActive}
            className="size-10 rounded-full"
            aria-label={isPlaying ? 'Pause' : 'Resume live'}
          >
            {isPlaying ? (
              <Pause className="size-5" />
            ) : (
              <Play className="size-5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={stop}
            disabled={!isActive}
            aria-label="Stop listening"
          >
            <Square className="size-4" />
          </Button>
        </div>
        <div className="flex w-full max-w-md items-center gap-2">
          <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
            {formatDuration(progress)}
          </span>
          {/* Non-interactive: live radio cannot be scrubbed. */}
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-10 text-[11px] tabular-nums text-muted-foreground">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Volume */}
      <div className="hidden w-40 items-center gap-2 sm:flex">
        <Volume2 className="size-4 shrink-0 text-muted-foreground" />
        <Slider
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={(v) => setVolume(v[0] / 100)}
          aria-label="Volume"
        />
      </div>
    </div>
  )
}
