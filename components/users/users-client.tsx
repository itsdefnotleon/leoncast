"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserDialog } from "@/components/users/user-dialog"
import { updateUserRole, deleteUser } from "@/lib/actions/users"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

type UserRow = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function UsersClient({
  users,
  currentUserId,
}: {
  users: UserRow[]
  currentUserId: string
}) {
  const router = useRouter()

  async function handleRole(id: string, role: "admin" | "dj") {
    const res = await updateUserRole(id, role)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("Role updated")
    router.refresh()
  }

  async function handleDelete(id: string) {
    const res = await deleteUser(id)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success("User removed")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <UserDialog />
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId
              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-accent/10 text-xs text-accent">
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium leading-tight">
                          {u.name}
                          {isSelf && (
                            <Badge variant="secondary" className="ml-2 font-normal">
                              You
                            </Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground sm:hidden">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRole(u.id, v as "admin" | "dj")}
                      disabled={isSelf}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="dj">DJ</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(u.id)}
                      disabled={isSelf}
                      aria-label={`Remove ${u.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
