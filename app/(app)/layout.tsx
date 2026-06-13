import { requireUser } from '@/lib/auth-helpers'
import { Sidebar } from '@/components/sidebar'
import { PlayerProvider } from '@/components/player/player-provider'
import { PlayerBar } from '@/components/player/player-bar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <PlayerProvider>
      <div className="flex h-dvh overflow-hidden bg-background">
        <Sidebar
          user={{
            name: user.name,
            email: user.email,
            role: (user as { role?: string }).role ?? 'dj',
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
          <PlayerBar />
        </div>
      </div>
    </PlayerProvider>
  )
}
