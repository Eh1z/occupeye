import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import type { AuthRole } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await params
  const body = (await request.json()) as { role?: AuthRole }

  if (!body.role) {
    return NextResponse.json({ error: 'Missing role' }, { status: 400 })
  }

  const result = await auth.api.setRole({
    body: {
      userId,
      role: body.role,
    },
    headers: await headers(),
  })

  return NextResponse.json(result)
}