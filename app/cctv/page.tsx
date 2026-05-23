import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { AuthRole } from '@/lib/auth'
import CCTVClient from '@/components/cctv/CCTVClient'

export default async function CCTVPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  if (session.user.role === 'student') {
    redirect('/')
  }

  return <CCTVClient role={session.user.role as AuthRole} />
}
