'use client'

import { useEffect, useState, useRef } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import CCTVTestbed from '@/components/CCTVTestbed'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Circle, Shield, EyeOff } from 'lucide-react'
import type { AuthRole } from '@/lib/auth'

const INITIAL_ROOMS: Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy'>[] = [
  { id: 'classroom-a', name: 'Classroom A', capacity: 20, currentOccupants: 0 },
  { id: 'classroom-b', name: 'Classroom B', capacity: 30, currentOccupants: 0 },
  { id: 'classroom-c', name: 'Classroom C', capacity: 25, currentOccupants: 0 },
  { id: 'classroom-d', name: 'Classroom D', capacity: 35, currentOccupants: 0 },
  { id: 'classroom-e', name: 'Classroom E', capacity: 40, currentOccupants: 0 },
  { id: 'classroom-f', name: 'Classroom F', capacity: 28, currentOccupants: 0 },
]

type RoomsClientProps = {
  role: AuthRole
}

export default function RoomsClient({ role }: RoomsClientProps) {
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
  }, [store])

  if (!mounted) return null

  const rooms = Object.values(store.rooms)
  const selectedRoom = store.rooms[selectedRoomId] || rooms[0]
  const canManageRooms = role !== 'student'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rooms</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{canManageRooms ? 'Manage occupancy and bookings.' : 'Read-only room availability for students.'}</p>
          </div>
          <Badge variant={canManageRooms ? 'secondary' : 'outline'} className="capitalize">
            <Shield className="mr-1 h-3 w-3" />
            {role}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden p-4 md:p-6">
        <div className="w-full shrink-0 overflow-y-auto md:w-80">
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

        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {selectedRoom && (
            <>
              <Card className="shrink-0">
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

              {!canManageRooms ? (
                <Card className="border-dashed border-blue-200 bg-blue-50/80 dark:border-blue-800 dark:bg-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <EyeOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Student view
                    </CardTitle>
                    <CardDescription>
                      Students can review room availability only. Booking, CCTV, and occupancy changes are reserved for lecturers and admins.
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
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
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}