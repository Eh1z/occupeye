'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Building2, LayoutDashboard, Grid3x3, Camera, LogsIcon, Shield, UserCircle2, LogOut, Settings2, Users } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const baseItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Rooms',
    href: '/rooms',
    icon: Grid3x3,
  },
]

const lecturerItems = [
  {
    title: 'CCTV Detection',
    href: '/cctv',
    icon: Camera,
  },
  {
    title: 'Activity Logs',
    href: '/logs',
    icon: LogsIcon,
  },
]

const adminItems = [
  {
    title: 'User Admin',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings2,
  },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  const role = session?.user?.role ?? 'student'
  const navItems = [
    ...baseItems,
    ...(role === 'student' ? [] : lecturerItems),
    ...(role === 'admin' ? adminItems : []),
  ]

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in')
        },
      },
    })
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-lg leading-none">OccupEye</p>
            <p className="text-xs text-muted-foreground">Smart occupancy control</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={isActive}>
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
        <div className="mt-4 border-t border-sidebar-border px-4 py-4">
          {isPending ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : session ? (
            <div className="space-y-3 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 text-sidebar-foreground">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{session.user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <Badge variant={role === 'admin' ? 'default' : role === 'lecturer' ? 'secondary' : 'outline'} className="capitalize">
                  <Shield className="mr-1 h-3 w-3" />
                  {role}
                </Badge>
                <Button variant="ghost" size="sm" className="gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" onClick={() => router.push('/sign-in')}>
              Sign in
            </Button>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
