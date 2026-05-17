'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import MetricsCard from '@/components/MetricsCard'
import ActivityLog from '@/components/ActivityLog'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const INITIAL_ROOMS: Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy'>[] = [
  { id: 'room-a', name: 'Room A', capacity: 20, currentOccupants: 0 },
  { id: 'room-b', name: 'Room B', capacity: 30, currentOccupants: 0 },
  { id: 'room-c', name: 'Room C', capacity: 25, currentOccupants: 0 },
  { id: 'room-d', name: 'Room D', capacity: 35, currentOccupants: 0 },
  { id: 'room-e', name: 'Room E', capacity: 40, currentOccupants: 0 },
  { id: 'room-f', name: 'Room F', capacity: 28, currentOccupants: 0 },
]

export default function Dashboard() {
  const store = useRoomStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    store.initializeRooms(INITIAL_ROOMS)
    setMounted(true)
  }, [store])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
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
  }
  const recentLogs = store.getRecentLogs(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Monitor your lecture halls in real-time</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Metrics */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Key Metrics</h2>
            <MetricsCard
              totalHalls={metrics.totalHalls}
              occupiedHalls={metrics.occupiedHalls}
              availableHalls={metrics.availableHalls}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Manage Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  View all rooms, check status, and make bookings
                </p>
                <Link href="/rooms" className="w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Rooms</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  CCTV Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  Upload CCTV footage and detect occupancy
                </p>
                <Link href="/cctv" className="w-full">
                  <Button variant="outline" className="w-full">Go to Detection</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ArrowRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  View complete history and events
                </p>
                <Link href="/logs" className="w-full">
                  <Button variant="outline" className="w-full">View Logs</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
            <Card>
              <CardContent className="pt-6">
                {recentLogs.length > 0 ? (
                  <ActivityLog logs={recentLogs} />
                ) : (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">No activity yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>
                  <strong>1. Go to Rooms:</strong> Navigate to the Rooms section to see all lecture halls
                </li>
                <li>
                  <strong>2. Upload CCTV:</strong> Go to CCTV Detection and upload an image to detect occupancy
                </li>
                <li>
                  <strong>3. Check Status:</strong> See if each room is Available or Occupied
                </li>
                <li>
                  <strong>4. Make Bookings:</strong> Book classes when rooms are available
                </li>
                <li>
                  <strong>5. View History:</strong> Check Activity Logs to see all events and updates
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
