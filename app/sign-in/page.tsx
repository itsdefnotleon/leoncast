import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { getUserCount } from '@/lib/actions/users'
import { Logo } from '@/components/logo'
import { SignInForm } from '@/components/sign-in-form'

export default async function SignInPage() {
  const session = await getSession()
  if (session?.user) redirect('/')

  const userCount = await getUserCount()
  if (userCount === 0) redirect('/setup')

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <Logo width={200} height={48} priority />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-balance">Broadcast Console</h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Sign in to manage your stations and automation.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <SignInForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Accounts are provisioned by an administrator. Contact your station
          admin for access.
        </p>
      </div>
    </main>
  )
}
