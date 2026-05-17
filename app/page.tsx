'use client'

import { useEffect, useState } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import MetricsCard from '@/components/MetricsCard'
import RoomStatusGrid from '@/components/RoomStatusGrid'
import ActivityLog from '@/components/ActivityLog'
import CCTVTestbed from '@/components/CCTVTestbed'
import { BookOpen, Zap, TrendingUp } from 'lucide-react'

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
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-a')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    store.initializeRooms(INITIAL_ROOMS)
    setMounted(true)
  }, [])

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

  const rooms = Object.values(store.rooms)
  const selectedRoom = store.rooms[selectedRoomId] || rooms[0]
  const metrics = {
    totalHalls: store.getTotalHalls(),
    occupiedHalls: store.getOccupiedRooms().length,
    availableHalls: store.getAvailableRooms().length,
  }
  const recentLogs = store.getRecentLogs(20)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl p-4  sm:px-6 lg:px-8">
          <div className="">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">🏫 OccupEye</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
              Real-time Lecture Hall Occupancy Detection System
            </p>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Analytics & Monitoring */}
          <div className="space-y-6 lg:col-span-2">
            {/* Metrics */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h2>
              <MetricsCard
                totalHalls={metrics.totalHalls}
                occupiedHalls={metrics.occupiedHalls}
                availableHalls={metrics.availableHalls}
              />
            </div>

            {/* Room Selection Guide */}
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
              <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">👉 How to Use:</h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>
                  <strong>1. Upload CCTV:</strong> Drag a hall photo into the CCTV testbed (right panel)
                </li>
                <li>
                  <strong>2. Run Detection:</strong> Click "Detect Occupants" button
                </li>
                <li>
                  <strong>3. Check Status:</strong> See if room is FREE (🟢) or OCCUPIED (🔴)
                </li>
                <li>
                  <strong>4. Book if Free:</strong> Click "Book Class" if available
                </li>
                <li>
                  <strong>5. 2-Hour Block:</strong> If occupied, room blocked for 2 hours
                </li>
              </ol>
            </div>

            {/* Room Status Grid */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Select a Room to Test</h2>
              <RoomStatusGrid rooms={rooms} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
            </div>

            {/* Activity Log */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Live Activity Feed</h2>
              <ActivityLog logs={recentLogs} />
            </div>
          </div>

          {/* Right Column: CCTV Testbed */}
          <div className="h-fit">
            <div className="sticky top-4">
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">Upload CCTV Image</h2>
              {selectedRoom && (
                <CCTVTestbed
                  room={selectedRoom}
                  onDetectionComplete={(occupantCount) => {
                    store.updateOccupancy(selectedRoom.id, occupantCount)
                  }}
                />
              )}

              {/* Info Box */}
              <div className="mt-6 rounded-lg border border-slate-200 bg-slate-100 p-4 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">💡 Tips:</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <li>✓ Use any photo with people</li>
                  <li>✓ Works with crowd photos, classrooms, offices</li>
                  <li>✓ Processing happens on your device</li>
                  <li>✓ No data sent to servers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
