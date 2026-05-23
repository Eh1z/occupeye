import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { AuthRole } from '@/lib/auth'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

export default async function AdminUsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  if (session.user.role !== 'admin') {
    redirect('/')
  }

  return <AdminUsersClient role={session.user.role as AuthRole} />
}