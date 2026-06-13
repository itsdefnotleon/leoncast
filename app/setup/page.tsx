import { redirect } from 'next/navigation'
import { getUserCount } from '@/lib/actions/users'
import { Logo } from '@/components/logo'
import { SetupForm } from '@/components/setup-form'

export default async function SetupPage() {
  const userCount = await getUserCount()
  if (userCount > 0) redirect('/sign-in')

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <Logo width={200} height={48} priority />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-balance">
              Initial Setup
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Create the first administrator account to get your station on the
              air.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SetupForm />
        </div>
      </div>
    </main>
  )
}
