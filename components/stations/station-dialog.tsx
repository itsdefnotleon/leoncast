'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createStation, updateStation } from '@/lib/actions/stations'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type Station = {
  id: number
  name: string
  shortcode: string
  description: string | null
  genre: string | null
  frequency: string | null
  isPublic: boolean
}

export function StationDialog({
  open,
  onOpenChange,
  station,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  station?: Station
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isPublic, setIsPublic] = useState(station?.isPublic ?? true)
  const editing = Boolean(station)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get('name')),
      shortcode: String(form.get('shortcode'))
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_'),
      description: String(form.get('description')),
      genre: String(form.get('genre')),
      frequency: String(form.get('frequency')),
      isPublic,
    }

    const result = editing
      ? await updateStation(station!.id, payload)
      : await createStation(payload)

    setLoading(false)
    if (result?.success) {
      toast.success(editing ? 'Station updated.' : 'Station created.')
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error('Something went wrong.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit station' : 'New station'}</DialogTitle>
          <DialogDescription>
            Configure a broadcast channel for your network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Station name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={station?.name}
              placeholder="leonCAST FM"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="shortcode">Shortcode</Label>
              <Input
                id="shortcode"
                name="shortcode"
                required
                defaultValue={station?.shortcode}
                placeholder="leoncast_fm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input
                id="frequency"
                name="frequency"
                defaultValue={station?.frequency ?? ''}
                placeholder="101.5 FM"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="genre">Genre</Label>
            <Input
              id="genre"
              name="genre"
              defaultValue={station?.genre ?? ''}
              placeholder="Indie / Electronic"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={station?.description ?? ''}
              placeholder="What this station is all about."
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">Public station</p>
              <p className="text-xs text-muted-foreground">
                Visible on your public directory.
              </p>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="font-semibold">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editing ? (
                'Save changes'
              ) : (
                'Create station'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
