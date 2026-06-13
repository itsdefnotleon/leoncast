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

type PlayerContextValue = {
  queue: Track[]
  current: Track | null
  index: number
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  playQueue: (tracks: Track[], startIndex?: number) => void
  playTrack: (track: Track) => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (v: number) => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)

  const current = queue[index] ?? null

  useEffect(() => {
    audioRef.current = new Audio()
    const audio = audioRef.current
    audio.volume = volume

    const onTime = () => setProgress(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onEnd = () => setIndex((i) => i + 1)
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

  // Load the current track when index/queue changes.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!current) {
      audio.pause()
      return
    }
    audio.src = fileUrl(current.url)
    audio.load()
    audio.play().catch(() => setIsPlaying(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id])

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    if (tracks.length === 0) return
    setQueue(tracks)
    setIndex(startIndex)
  }, [])

  const playTrack = useCallback((track: Track) => {
    setQueue([track])
    setIndex(0)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [current])

  const next = useCallback(() => {
    setIndex((i) => (i < queue.length - 1 ? i + 1 : i))
  }, [queue.length])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      return
    }
    setIndex((i) => (i > 0 ? i - 1 : i))
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) audio.currentTime = time
  }, [])

  const setVolume = useCallback((v: number) => {
    setVolumeState(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const value = useMemo(
    () => ({
      queue,
      current,
      index,
      isPlaying,
      progress,
      duration,
      volume,
      playQueue,
      playTrack,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
    }),
    [
      queue,
      current,
      index,
      isPlaying,
      progress,
      duration,
      volume,
      playQueue,
      playTrack,
      togglePlay,
      next,
      prev,
      seek,
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
