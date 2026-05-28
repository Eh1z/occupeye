'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import MetricsCard from '@/components/MetricsCard'
import ActivityLog from '@/components/ActivityLog'
import { ArrowRight, Lightbulb, Shield, Users, Camera, LogsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AuthRole } from '@/lib/auth'

type InitialLectureHall = Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy' | 'equipment'> & {
  equipment?: string[]
}

const INITIAL_ROOMS: InitialLectureHall[] = [
  { id: 'room-a', name: 'Room A', capacity: 20, currentOccupants: 0 },
  { id: 'room-b', name: 'Room B', capacity: 30, currentOccupants: 0 },
  { id: 'room-c', name: 'Room C', capacity: 25, currentOccupants: 0 },
  { id: 'room-d', name: 'Room D', capacity: 35, currentOccupants: 0 },
  { id: 'room-e', name: 'Room E', capacity: 40, currentOccupants: 0 },
  { id: 'room-f', name: 'Room F', capacity: 28, currentOccupants: 0 },
]

type DashboardClientProps = {
  role: AuthRole
  userName: string
}

export default function DashboardClient({ role, userName }: DashboardClientProps) {
  const store = useRoomStore()
  const [mounted, setMounted] = useState(false)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      if (!Object.keys(store.rooms).length) {
        store.initializeRooms(INITIAL_ROOMS)
      }
      setMounted(true)
    }
  }, [store])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  const metrics = {
    totalHalls: store.getTotalHalls(),
    occupiedHalls: store.getOccupiedRooms().length,
    availableHalls: store.getAvailableRooms().length,
    readyHalls: store.getLectureReadyRooms().length,
  }
  const recentLogs = store.getRecentLogs(5)

  const isStudent = role === 'student'
  const isLecturer = role === 'lecturer'
  const isAdmin = role === 'admin'

  const quickActions = [
    {
      title: 'Manage Rooms',
      description: isStudent ? 'See room availability and occupancy levels' : 'View all rooms, check status, and manage bookings',
      href: '/rooms',
      label: 'Go to Rooms',
      icon: ArrowRight,
      visible: true,
    },
    {
      title: 'CCTV Detection',
      description: 'Upload CCTV footage and detect occupancy',
      href: '/cctv',
      label: 'Open CCTV',
      icon: Camera,
      visible: !isStudent,
    },
    {
      title: 'Activity Logs',
      description: 'View complete history and events',
      href: '/logs',
      label: 'View Logs',
      icon: LogsIcon,
      visible: !isStudent,
    },
    {
      title: 'Admin Users',
      description: 'Manage account roles and access',
      href: '/admin/users',
      label: 'Open Admin',
      icon: Users,
      visible: isAdmin,
    },
  ].filter((item) => item.visible)

  const gettingStarted = isStudent
    ? [
      'Open Rooms to see current availability.',
      'Use the dashboard to monitor which halls are occupied.',
      'Contact a lecturer if you need a booking or CCTV review.',
    ]
    : isLecturer
      ? [
        'Review the dashboard metrics and recent activity.',
        'Use Rooms to manage bookings and inspect room state.',
        'Use CCTV Detection when occupancy needs confirmation.',
        'Check Logs to audit room changes and anomalies.',
      ]
      : [
        'Use the dashboard to monitor the full system.',
        'Admin Users lets you change account roles later.',
        'Rooms, CCTV, and Logs are available for operational control.',
      ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                <Badge variant={isAdmin ? 'default' : isLecturer ? 'secondary' : 'outline'} className="capitalize">
                  <Shield className="mr-1 h-3 w-3" />
                  {role}
                </Badge>
              </div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {isStudent
                  ? 'Monitor your lecture halls in real time.'
                  : `Welcome back, ${userName}. Manage operations from the lecturer and admin views.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto container space-y-8">
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Key Metrics</h2>
            <MetricsCard
              totalHalls={metrics.totalHalls}
              occupiedHalls={metrics.occupiedHalls}
              availableHalls={metrics.availableHalls}
              readyHalls={metrics.readyHalls}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card key={action.title} className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{action.description}</p>
                    <Link href={action.href} className="w-full">
                      <Button className="w-full">{action.label}</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardContent className="pt-6">
                {recentLogs.length > 0 ? (
                  <ActivityLog logs={recentLogs} />
                ) : (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-amber-200 bg-amber-50/90 dark:border-amber-800 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {gettingStarted.map((item, index) => (
                  <li key={item}>
                    <strong>{index + 1}.</strong> {item}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}