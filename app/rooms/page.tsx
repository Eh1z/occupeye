'use client'

import { useEffect, useState, useRef } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import RoomStatusGrid from '@/components/RoomStatusGrid'
import CCTVTestbed from '@/components/CCTVTestbed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Circle } from 'lucide-react'

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
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      if (!Object.keys(store.rooms).length) {
        store.initializeRooms(INITIAL_ROOMS)
      }
      setMounted(true)
    }
  }, [])

  if (!mounted) return null

  const rooms = Object.values(store.rooms)
  const selectedRoom = store.rooms[selectedRoomId] || rooms[0]

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Compact Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rooms</h1>
      </div>

      {/* Main Content - Two Column */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4 md:p-6">
        {/* Left: Room List */}
        <div className="w-full flex-shrink-0 overflow-y-auto md:w-80">
          <div className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                  selectedRoomId === room.id
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle
                      className={`h-3 w-3 fill-current ${
                        room.status === 'occupied'
                          ? 'text-red-500'
                          : room.isBlockedForBooking
                            ? 'text-amber-500'
                            : 'text-green-500'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{room.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {room.currentOccupants}/{room.capacity}
                      </p>
                    </div>
                  </div>
                  {room.anomalyDetected && (
                    <div className="h-2 w-2 rounded-full bg-red-500" title="Anomaly" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: CCTV Upload & Details */}
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {selectedRoom && (
            <>
              {/* Room Quick Info */}
              <Card className="flex-shrink-0">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedRoom.name}</CardTitle>
                    <Circle
                      className={`h-3 w-3 fill-current ${
                        selectedRoom.status === 'occupied'
                          ? 'text-red-500'
                          : selectedRoom.isBlockedForBooking
                            ? 'text-amber-500'
                            : 'text-green-500'
                      }`}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Current</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedRoom.currentOccupants}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Capacity</p>
                      <p className="font-bold text-slate-900 dark:text-white">{selectedRoom.capacity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Usage</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {Math.round((selectedRoom.currentOccupants / selectedRoom.capacity) * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CCTV Testbed */}
              <Card className="flex-1 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Upload CCTV</CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto">
                  <CCTVTestbed
                    room={selectedRoom}
                    onDetectionComplete={(occupantCount) => {
                      store.updateOccupancy(selectedRoom.id, occupantCount)
                    }}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
