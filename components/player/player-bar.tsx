'use client'

import { usePlayer } from '@/components/player/player-provider'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { formatDuration } from '@/lib/format'
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Music2,
} from 'lucide-react'

export function PlayerBar() {
  const {
    current,
    isPlaying,
    progress,
    duration,
    volume,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  } = usePlayer()

  return (
    <div className="flex h-20 shrink-0 items-center gap-4 border-t border-border bg-card px-4 sm:px-6">
      {/* Track info */}
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:w-64 sm:flex-none">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-secondary">
          <Music2 className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {current ? current.title : 'Nothing playing'}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {current?.artist ?? 'Select a track or playlist to begin'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-[2] flex-col items-center gap-1.5">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={prev}
            disabled={!current}
            aria-label="Previous track"
          >
            <SkipBack className="size-4" />
          </Button>
          <Button
            size="icon"
            onClick={togglePlay}
            disabled={!current}
            className="size-10 rounded-full"
            aria-label={isPlaying ? 'Pause' : 'Play'}
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
            onClick={next}
            disabled={!current}
            aria-label="Next track"
          >
            <SkipForward className="size-4" />
          </Button>
        </div>
        <div className="flex w-full max-w-md items-center gap-2">
          <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
            {formatDuration(progress)}
          </span>
          <Slider
            value={[progress]}
            max={duration || 100}
            step={1}
            onValueChange={(v) => seek(v[0])}
            disabled={!current}
            className="flex-1"
            aria-label="Seek"
          />
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
