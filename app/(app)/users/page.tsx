import { redirect } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { UsersClient } from "@/components/users/users-client"
import { getCurrentUser } from "@/lib/auth-helpers"
import { listUsers } from "@/lib/actions/users"

export default async function UsersPage() {
  const current = await getCurrentUser()
  if (!current) redirect("/sign-in")
  if (current.role !== "admin") redirect("/")

  const users = await listUsers()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Manage who can access leonCAST. Accounts are created here — there is no public sign-up."
      />
      <UsersClient users={users} currentUserId={current.id} />
    </div>
  )
}
