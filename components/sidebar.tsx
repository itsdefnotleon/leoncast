'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Logo } from '@/components/logo'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Radio,
  Music2,
  ListMusic,
  CalendarClock,
  Users,
  LogOut,
} from 'lucide-react'
import { toast } from 'sonner'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/stations', label: 'Stations', icon: Radio },
  { href: '/media', label: 'Media Library', icon: Music2 },
  { href: '/playlists', label: 'Playlists', icon: ListMusic },
  { href: '/schedule', label: 'Schedule', icon: CalendarClock },
]

const adminNav = [{ href: '/users', label: 'Users', icon: Users }]

export function Sidebar({
  user,
}: {
  user: { name: string; email: string; role: string }
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    toast.success('Signed out.')
    router.push('/sign-in')
    router.refresh()
  }

  const items = user.role === 'admin' ? [...nav, ...adminNav] : nav

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Logo width={150} height={36} priority />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary uppercase">
            {user.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="mt-1 w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
