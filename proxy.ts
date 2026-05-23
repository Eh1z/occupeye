import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

const publicRoutes = new Set(['/sign-in', '/sign-up', '/forgot-password', '/reset-password'])

const routeRules = [
  { prefix: '/admin', roles: ['admin'] as const },
  { prefix: '/cctv', roles: ['lecturer', 'admin'] as const },
  { prefix: '/logs', roles: ['lecturer', 'admin'] as const },
  { prefix: '/rooms', roles: ['student', 'lecturer', 'admin'] as const },
  { prefix: '/settings', roles: ['student', 'lecturer', 'admin'] as const },
  { prefix: '/', roles: ['student', 'lecturer', 'admin'] as const },
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/') || publicRoutes.has(pathname)) {
    return NextResponse.next()
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  if (publicRoutes.has(pathname) && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const matchedRule = routeRules.find((rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`))

  if (matchedRule && !matchedRule.roles.some((r) => r === session.user.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}