'use client'

import { useEffect, useState } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import RoomStatusGrid from '@/components/RoomStatusGrid'
import CCTVTestbed from '@/components/CCTVTestbed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const INITIAL_ROOMS: Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy'>[] = [
  { id: 'room-a', name: 'Room A', capacity: 20, currentOccupants: 0 },
  { id: 'room-b', name: 'Room B', capacity: 30, currentOccupants: 0 },
  { id: 'room-c', name: 'Room C', capacity: 25, currentOccupants: 0 },
  { id: 'room-d', name: 'Room D', capacity: 35, currentOccupants: 0 },
  { id: 'room-e', name: 'Room E', capacity: 40, currentOccupants: 0 },
  { id: 'room-f', name: 'Room F', capacity: 28, currentOccupants: 0 },
]

export default function RoomsPage() {
  const store = useRoomStore()
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-a')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!Object.keys(store.rooms).length) {
      store.initializeRooms(INITIAL_ROOMS)
    }
    setMounted(true)
  }, [store])

  if (!mounted) return null

  const rooms = Object.values(store.rooms)
  const selectedRoom = store.rooms[selectedRoomId] || rooms[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Rooms</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">View room status and make bookings</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Room Grid */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">All Rooms</h2>
            <RoomStatusGrid rooms={rooms} selectedRoomId={selectedRoomId} onSelectRoom={setSelectedRoomId} />
          </div>

          {/* Selected Room Details with CCTV */}
          {selectedRoom && (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Room Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedRoom.name}</CardTitle>
                    <CardDescription>Selected for CCTV upload</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Capacity</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedRoom.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Occupancy</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedRoom.currentOccupants}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
                      <div className="mt-1 flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            selectedRoom.status === 'occupied'
                              ? 'bg-red-500'
                              : selectedRoom.isBlockedForBooking
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                          }`}
                        />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {selectedRoom.status === 'occupied'
                            ? 'Occupied'
                            : selectedRoom.isBlockedForBooking
                              ? 'Blocked'
                              : 'Available'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* CCTV Testbed */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload CCTV Image</CardTitle>
                    <CardDescription>Upload an image to detect occupancy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CCTVTestbed
                      room={selectedRoom}
                      onDetectionComplete={(occupantCount) => {
                        store.updateOccupancy(selectedRoom.id, occupantCount)
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
