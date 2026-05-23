import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { AuthRole } from '@/lib/auth'
import LogsClient from '@/components/logs/LogsClient'

export default async function LogsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  if (session.user.role === 'student') {
    redirect('/')
  }

  return <LogsClient role={session.user.role as AuthRole} />
}
