'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMedia } from '@/lib/actions/media'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, UploadCloud, FileAudio, X, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { formatDuration, formatFileSize } from '@/lib/format'

type StationOption = { id: number; name: string }

type PendingFile = {
  file: File
  duration: number
  title: string
  artist: string
}

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src)
      resolve(Math.round(audio.duration) || 0)
    }
    audio.onerror = () => resolve(0)
    audio.src = URL.createObjectURL(file)
  })
}

function guessMeta(name: string) {
  const base = name.replace(/\.[^.]+$/, '')
  const parts = base.split(' - ')
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() }
  }
  return { artist: '', title: base.trim() }
}

export function UploadDialog({ stations }: { stations: StationOption[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<PendingFile[]>([])
  const [stationId, setStationId] = useState<string>('none')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  async function addFiles(files: FileList | File[]) {
    const audioFiles = Array.from(files).filter((f) =>
      f.type.startsWith('audio/'),
    )
    if (audioFiles.length === 0) {
      toast.error('Please choose audio files.')
      return
    }
    const enriched = await Promise.all(
      audioFiles.map(async (file) => {
        const duration = await readAudioDuration(file)
        const meta = guessMeta(file.name)
        return { file, duration, ...meta }
      }),
    )
    setPending((prev) => [...prev, ...enriched])
  }

  function updatePending(index: number, patch: Partial<PendingFile>) {
    setPending((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    )
  }

  function removePending(index: number) {
    setPending((prev) => prev.filter((_, i) => i !== index))
  }

  function reset() {
    setPending([])
    setStationId('none')
    setUploading(false)
  }

  async function handleUpload() {
    if (pending.length === 0) return
    setUploading(true)
    let success = 0
    for (const item of pending) {
      try {
        const fd = new FormData()
        fd.append('file', item.file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? 'Upload failed')
        }
        const { pathname, fileSize } = await res.json()
        await createMedia({
          title: item.title || item.file.name,
          artist: item.artist,
          duration: item.duration,
          pathname,
          fileSize,
          stationId: stationId === 'none' ? undefined : Number(stationId),
        })
        success++
      } catch (err) {
        console.error('[v0] upload item failed', err)
        toast.error(`Failed to upload ${item.file.name}`)
      }
    }
    setUploading(false)
    if (success > 0) {
      toast.success(`Uploaded ${success} track${success > 1 ? 's' : ''}.`)
      reset()
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!uploading) {
        if (!v) reset()
        setOpen(v)
      }
    }}>
      <DialogTrigger>
        <button type="button" className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors">
          <Upload className="size-4 mr-2" />
          Upload media
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
          <DialogDescription>
            Add audio tracks to your library. MP3, WAV, OGG and more.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              addFiles(e.dataTransfer.files)
            }}
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <UploadCloud className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">
              Drop audio files or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Duration is detected automatically
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>

          {pending.length > 0 ? (
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
              {pending.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-border p-2.5"
                >
                  <FileAudio className="size-5 shrink-0 text-primary" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <input
                      value={item.title}
                      onChange={(e) =>
                        updatePending(i, { title: e.target.value })
                      }
                      placeholder="Title"
                      className="w-full rounded border border-border bg-transparent px-2 py-1 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        value={item.artist}
                        onChange={(e) =>
                          updatePending(i, { artist: e.target.value })
                        }
                        placeholder="Artist"
                        className="w-full rounded border border-border bg-transparent px-2 py-1 text-xs text-muted-foreground"
                      />
                      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                        {formatDuration(item.duration)} ·{' '}
                        {formatFileSize(item.file.size)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => removePending(i)}
                    disabled={uploading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label>Assign to station (optional)</Label>
            <Select value={stationId} onValueChange={setStationId}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {stations.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleUpload}
            disabled={pending.length === 0 || uploading}
            className="font-semibold"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading…
              </>
            ) : (
              `Upload ${pending.length || ''} track${pending.length === 1 ? '' : 's'}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
