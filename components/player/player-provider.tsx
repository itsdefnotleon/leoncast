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

export type Track = {
  id: number
  title: string
  artist: string | null
  /** A ready-to-play stream URL (already resolved, e.g. via fileUrl). */
  url: string
  duration: number
}

export type StationInfo = {
  id: number
  name: string
  shortcode: string
}

type PlayMode = 'live' | 'queue' | null

type PlayerContextValue = {
  station: StationInfo | null
  current: Track | null
  isPlaying: boolean
  /** Seconds into the current track. Display only — live radio is not seekable. */
  progress: number
  duration: number
  volume: number
  /** True when a station is tuned in to its live broadcast. */
  isLive: boolean
  /** True when any track is loaded — live broadcast or on-demand queue. */
  isActive: boolean
  /** Tune into a station's live broadcast at the current on-air position. */
  tuneIn: (station: StationInfo, tracks: Track[]) => void
  /** Play an on-demand queue starting at the given index (default 0). */
  playQueue: (tracks: Track[], startIndex?: number) => void
  /** Replace the on-demand queue and play from the first track. */
  setQueue: (tracks: Track[]) => void
  /** Pause/resume. Resuming a live broadcast re-syncs to the on-air position. */
  togglePlay: () => void
  /** Leave the broadcast / clear the queue entirely. */
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
  const indexRef = useRef(0)
  const modeRef = useRef<PlayMode>(null)
  const offsetRef = useRef(0)

  const [station, setStation] = useState<StationInfo | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [mode, setMode] = useState<PlayMode>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  const current = tracks[index] ?? null
  const isLive = mode === 'live'
  const isActive = current !== null

  useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])

  useEffect(() => {
    indexRef.current = index
  }, [index])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = volume

    const onTime = () => setProgress(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => {
      const len = tracksRef.current.length
      if (len === 0) return
      const next = indexRef.current + 1
      // On-demand queues stop at the end; a live broadcast loops forever.
      if (modeRef.current === 'queue' && next >= len) {
        setIsPlaying(false)
        return
      }
      offsetRef.current = 0
      setIndex(next % len)
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

  // Load and play the current track whenever it changes.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !current) return

    audio.src = current.url
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
    modeRef.current = 'live'
    setMode('live')
    setStation(nextStation)
    setTracks(nextTracks)
    setIndex(startIndex)
  }, [])

  const playQueue = useCallback((nextTracks: Track[], startIndex = 0) => {
    if (nextTracks.length === 0) return
    const start = Math.min(Math.max(startIndex, 0), nextTracks.length - 1)
    offsetRef.current = 0
    modeRef.current = 'queue'
    setMode('queue')
    setStation(null)
    setTracks(nextTracks)
    setIndex(start)
  }, [])

  const setQueue = useCallback(
    (nextTracks: Track[]) => playQueue(nextTracks, 0),
    [playQueue],
  )

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
    modeRef.current = null
    setMode(null)
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
    if (modeRef.current === 'live') {
      // Resuming a live stream snaps back to the current on-air position.
      const { index: liveIndex, offset } = computeLivePosition(tracksRef.current)
      offsetRef.current = offset
      if (liveIndex === indexRef.current) {
        try {
          audio.currentTime = offset
        } catch {
          // ignore
        }
        audio.play().catch(() => setIsPlaying(false))
      } else {
        setIndex(liveIndex)
      }
    } else {
      // On-demand: resume from where we paused.
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [])

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
      isActive,
      tuneIn,
      playQueue,
      setQueue,
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
      isActive,
      tuneIn,
      playQueue,
      setQueue,
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
