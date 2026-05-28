import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import type { AuthRole } from '@/lib/auth'
import RoomsClient from '@/components/rooms/RoomsClient'

export default async function RoomsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  return <RoomsClient role={session.user.role as AuthRole} userName={session.user.name || session.user.email || ''} />
}
