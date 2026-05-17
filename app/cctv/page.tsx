'use client'

import { useEffect, useState } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import CCTVTestbed from '@/components/CCTVTestbed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const INITIAL_ROOMS: Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy'>[] = [
  { id: 'room-a', name: 'Room A', capacity: 20, currentOccupants: 0 },
  { id: 'room-b', name: 'Room B', capacity: 30, currentOccupants: 0 },
  { id: 'room-c', name: 'Room C', capacity: 25, currentOccupants: 0 },
  { id: 'room-d', name: 'Room D', capacity: 35, currentOccupants: 0 },
  { id: 'room-e', name: 'Room E', capacity: 40, currentOccupants: 0 },
  { id: 'room-f', name: 'Room F', capacity: 28, currentOccupants: 0 },
]

export default function CCTVPage() {
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">CCTV Detection</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Upload images to detect occupancy</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Room Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Room</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedRoomId} onValueChange={(value) => setSelectedRoomId(value || 'room-a')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} (Capacity: {room.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* CCTV Testbed */}
          {selectedRoom && (
            <Card>
              <CardHeader>
                <CardTitle>Upload CCTV Image - {selectedRoom.name}</CardTitle>
                <CardDescription>
                  Drag and drop an image to detect people in the room
                </CardDescription>
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
          )}

          {/* Room Status Summary */}
          {selectedRoom && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Room Status</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Occupancy</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {selectedRoom.currentOccupants}/{selectedRoom.capacity}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full ${
                        selectedRoom.status === 'occupied'
                          ? 'bg-red-500'
                          : selectedRoom.isBlockedForBooking
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                      }`}
                    />
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedRoom.status === 'occupied'
                        ? 'Occupied'
                        : selectedRoom.isBlockedForBooking
                          ? 'Blocked'
                          : 'Available'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Occupancy %</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {Math.round((selectedRoom.currentOccupants / selectedRoom.capacity) * 100)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
