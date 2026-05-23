'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, RefreshCw, Shield, Users2 } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { AuthRole } from '@/lib/auth'

type AdminUsersClientProps = {
  role: AuthRole
}

type ApiUser = {
  id: string
  name: string
  email: string
  role?: AuthRole
  emailVerified?: boolean
  createdAt?: string | Date
}

type ApiUsersResponse = {
  users: ApiUser[]
  total: number
  limit?: number
  offset?: number
}

export default function AdminUsersClient({ role }: AdminUsersClientProps) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [mutatingUserId, setMutatingUserId] = useState('')
  const [error, setError] = useState('')

  const query = useMemo(
    () => new URLSearchParams({
      ...(search ? { search } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      limit: '50',
      offset: '0',
    }),
    [roleFilter, search]
  )

  const fetchUsers = async () => {
    setLoading(true)
    setError('')

    const response = await fetch(`/api/admin/users?${query.toString()}`)

    if (!response.ok) {
      setError('Unable to load users.')
      setLoading(false)
      return
    }

    const data = (await response.json()) as ApiUsersResponse
    setUsers(data.users)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers().catch(() => {
      setError('Unable to load users.')
      setLoading(false)
    })
  }, [query])

  const updateRole = async (userId: string, newRole: AuthRole) => {
    setMutatingUserId(userId)
    setError('')

    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })

    if (!response.ok) {
      setError('Unable to update the user role.')
      setMutatingUserId('')
      return
    }

    await fetchUsers()
    setMutatingUserId('')
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push('/sign-in'),
      },
    })
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 px-4 py-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto container space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/90 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User administration</h1>
              <Badge variant="default" className="gap-1 capitalize">
                <Shield className="h-3 w-3" />
                {role}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Update student and lecturer roles after sign-up.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={fetchUsers} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total users</CardDescription>
              <CardTitle className="text-3xl">{total}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current admin</CardDescription>
              <CardTitle className="text-lg">{session.user.email}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Access scope</CardDescription>
              <CardTitle className="text-lg">Role changes only</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-slate-200/80 bg-white/95 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users2 className="h-5 w-5 text-blue-600" />
                  Users
                </CardTitle>
                <CardDescription>Search users and assign the correct role.</CardDescription>
              </div>
              <div className="flex flex-col gap-3 md:flex-row">
                <Input
                  placeholder="Search by name"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="md:w-64"
                />
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="md:w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => {
                      const userRole = (user.role ?? 'student') as AuthRole
                      const isCurrentUser = user.id === session.user.id

                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-slate-900 dark:text-white">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={userRole === 'admin' ? 'default' : userRole === 'lecturer' ? 'secondary' : 'outline'} className="capitalize">
                              {userRole}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.emailVerified ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Select
                                value={userRole}
                                onValueChange={(value) => updateRole(user.id, value as AuthRole)}
                                disabled={mutatingUserId === user.id}
                              >
                                <SelectTrigger className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="lecturer">Lecturer</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              {isCurrentUser && <span className="text-xs text-slate-500">You</span>}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}