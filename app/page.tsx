'use client'

import { useEffect, useState } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import MetricsCard from '@/components/MetricsCard'
import RoomStatusGrid from '@/components/RoomStatusGrid'
import ActivityLog from '@/components/ActivityLog'
import CCTVTestbed from '@/components/CCTVTestbed'

const INITIAL_ROOMS: Omit<LectureHall, 'status' | 'anomalyDetected' | 'lastUpdated' | 'lastUpdatedBy'>[] = [
  { id: 'room-a', name: 'Lecture Hall A', capacity: 20, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-b', name: 'Lecture Hall B', capacity: 30, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-c', name: 'Lecture Hall C', capacity: 25, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-d', name: 'Lecture Hall D', capacity: 35, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-e', name: 'Lecture Hall E', capacity: 40, currentOccupants: 0, manuallyScheduled: false },
  { id: 'room-f', name: 'Lecture Hall F', capacity: 28, currentOccupants: 0, manuallyScheduled: false },
]

export default function Dashboard() {
  const store = useRoomStore()
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-a')
  const [mounted, setMounted] = useState(false)

  // Initialize rooms on mount
  useEffect(() => {
    store.initializeRooms(INITIAL_ROOMS)
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-blue-600 dark:border-zinc-700 dark:border-t-blue-400" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="border-b border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Lecture Hall Occupancy System</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Real-time monitoring and CCTV-based occupancy detection with anomaly alerts
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
            <MetricsCard
              totalHalls={metrics.totalHalls}
              activeOccupancy={metrics.activeOccupancy}
              anomalyRate={metrics.anomalyRate}
            />

            {/* Room Status Grid */}
            <div>
              <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">Room Status</h2>
              <RoomStatusGrid rooms={rooms} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
            </div>

            {/* Activity Log */}
            <ActivityLog logs={recentLogs} />
          </div>

          {/* Right Column: CCTV Testbed */}
          <div className="h-fit">
            {selectedRoom && (
              <CCTVTestbed
                room={selectedRoom}
                onDetectionComplete={(occupantCount) => {
                  store.updateOccupancy(selectedRoom.id, occupantCount)
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
