import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const searchValue = url.searchParams.get('search') ?? undefined
  const role = url.searchParams.get('role') ?? undefined
  const limit = Number(url.searchParams.get('limit') ?? '25')
  const offset = Number(url.searchParams.get('offset') ?? '0')

  const result = await auth.api.listUsers({
    query: {
      searchValue,
      searchField: 'name',
      searchOperator: 'contains',
      limit,
      offset,
      sortBy: 'name',
      sortDirection: 'asc',
      ...(role ? { filterField: 'role', filterValue: role, filterOperator: 'eq' } : {}),
    },
    headers: await headers(),
  })

  return NextResponse.json(result)
}