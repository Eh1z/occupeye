'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AppSidebar from '@/components/AppSidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'

const authRoutes = new Set(['/sign-in', '/sign-up', '/forgot-password', '/reset-password'])

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = authRoutes.has(pathname)

  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">{children}</main>
      </SidebarProvider>
    </TooltipProvider>
  )
}