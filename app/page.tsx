'use client'

import { useEffect, useState } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import MetricsCard from '@/components/MetricsCard'
import RoomStatusGrid from '@/components/RoomStatusGrid'
import ActivityLog from '@/components/ActivityLog'
import CCTVTestbed from '@/components/CCTVTestbed'
import { BookOpen, Zap, TrendingUp } from 'lucide-react'

const INITIAL_ROOMS: Omit<LectureHall, 'status' | 'anomalyDetected' | 'lastUpdated' | 'lastUpdatedBy'>[] = [
  { id: 'room-a', name: 'Room A - Physics 101', capacity: 20, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-b', name: 'Room B - Mathematics', capacity: 30, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-c', name: 'Room C - Chemistry Lab', capacity: 25, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-d', name: 'Room D - Biology', capacity: 35, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-e', name: 'Room E - English Lit', capacity: 40, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-f', name: 'Room F - History', capacity: 28, currentOccupants: 0, manuallyScheduled: false },
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
    activeOccupancy: store.getActiveOccupancy(),
    anomalyRate: store.getAnomalyRate(),
  }
  const recentLogs = store.getRecentLogs(20)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
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
                activeOccupancy={metrics.activeOccupancy}
                anomalyRate={metrics.anomalyRate}
              />
            </div>

            {/* Room Selection Guide */}
            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
              <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">👉 How to Use:</h3>
              <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <li>
                  <strong>1. Select a Room:</strong> Click any room card below to select it (it will highlight in blue)
                </li>
                <li>
                  <strong>2. Upload Image:</strong> Drag a classroom photo into the upload area on the right
                </li>
                <li>
                  <strong>3. Run Detection:</strong> Click the "Detect Occupants" button to count people
                </li>
                <li>
                  <strong>4. Watch Updates:</strong> See occupancy count, status, and alerts update in real-time
                </li>
                <li>
                  <strong>5. Try More Rooms:</strong> Select a different room and repeat to test multiple halls
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
