'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { fileUrl } from '@/lib/format'

export type Track = {
  id: number
  title: string
  artist: string | null
  url: string
  duration: number
}

export type StationInfo = {
  id: number
  name: string
  shortcode: string
}

type PlayerContextValue = {
  station: StationInfo | null
  current: Track | null
  isPlaying: boolean
  /** Seconds into the current track. Display only — live radio is not seekable. */
  progress: number
  duration: number
  volume: number
  /** True when a station is tuned in (whether or not audio is actively playing). */
  isLive: boolean
  /** Tune into a station's live broadcast at the current on-air position. */
  tuneIn: (station: StationInfo, tracks: Track[]) => void
  /** Pause/resume. Resuming re-syncs to the live on-air position. */
  togglePlay: () => void
  /** Leave the broadcast entirely. */
  stop: () => void
  setVolume: (v: number) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

/**
 * Determine which track is "on air" right now and how far into it we are,
 * by laying the playlist end-to-end on an infinite loop anchored to the
 * absolute Unix clock. Every listener computes the same answer, so everyone
 * hears the same thing at the same moment — just like a real broadcast.
 */
function computeLivePosition(tracks: Track[]): { index: number; offset: number } {
  const total = tracks.reduce((sum, t) => sum + (t.duration || 0), 0)
  if (total <= 0) return { index: 0, offset: 0 }
  let elapsed = (Date.now() / 1000) % total
  for (let i = 0; i < tracks.length; i++) {
    const d = tracks[i].duration || 0
    if (elapsed < d) return { index: i, offset: elapsed }
    elapsed -= d
  }
  return { index: 0, offset: 0 }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const tracksRef = useRef<Track[]>([])
  const offsetRef = useRef(0)

  const [station, setStation] = useState<StationInfo | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  const current = tracks[index] ?? null
  const isLive = station !== null && tracks.length > 0

  useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = volume

    const onTime = () => setProgress(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => {
      // Continuous broadcast: roll straight into the next track, looping.
      offsetRef.current = 0
      setIndex((i) => {
        const len = tracksRef.current.length
        return len > 0 ? (i + 1) % len : 0
      })
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load and play the on-air track whenever it changes.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return

    audio.src = fileUrl(current.url)
    audio.load()

    const seekOffset = offsetRef.current
    offsetRef.current = 0

    const onReady = () => {
      if (seekOffset > 0 && seekOffset < (audio.duration || Infinity)) {
        try {
          audio.currentTime = seekOffset
        } catch {
          // ignore seek errors on some browsers
        }
      }
      audio.play().catch(() => setIsPlaying(false))
      audio.removeEventListener('canplay', onReady)
    }
    audio.addEventListener('canplay', onReady)

    return () => audio.removeEventListener('canplay', onReady)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id])

  const tuneIn = useCallback((nextStation: StationInfo, nextTracks: Track[]) => {
    if (nextTracks.length === 0) return
    const { index: startIndex, offset } = computeLivePosition(nextTracks)
    offsetRef.current = offset
    setStation(nextStation)
    setTracks(nextTracks)
    setIndex(startIndex)
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    setStation(null)
    setTracks([])
    setIndex(0)
    setProgress(0)
    setDuration(0)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || tracksRef.current.length === 0) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    // Resuming a live stream snaps back to the current on-air position.
    const { index: liveIndex, offset } = computeLivePosition(tracksRef.current)
    offsetRef.current = offset
    if (liveIndex === index) {
      try {
        audio.currentTime = offset
      } catch {
        // ignore
      }
      audio.play().catch(() => setIsPlaying(false))
    } else {
      setIndex(liveIndex)
    }
  }, [index])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const value = useMemo(
    () => ({
      station,
      current,
      isPlaying,
      progress,
      duration,
      volume,
      isLive,
      tuneIn,
      togglePlay,
      stop,
      setVolume,
    }),
    [
      station,
      current,
      isPlaying,
      progress,
      duration,
      volume,
      isLive,
      tuneIn,
      togglePlay,
      stop,
      setVolume,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider')
  return ctx
}
