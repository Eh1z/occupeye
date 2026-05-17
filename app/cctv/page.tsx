'use client'

import { useEffect, useState, useRef } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import CCTVTestbed from '@/components/CCTVTestbed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Circle, AlertTriangle } from 'lucide-react'
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">CCTV Detection</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-4 md:p-6">
        {/* Room Selector & Status Bar */}
        {selectedRoom && (
          <div className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <Select value={selectedRoomId} onValueChange={(value) => setSelectedRoomId(value || 'room-a')}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name} ({room.capacity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quick Status */}
            <div className="flex flex-1 items-center gap-4">
              <div className="flex items-center gap-2">
                <Circle
                  className={`h-3 w-3 fill-current ${
                    selectedRoom.status === 'occupied'
                      ? 'text-red-500'
                      : selectedRoom.isBlockedForBooking
                        ? 'text-amber-500'
                        : 'text-green-500'
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

              {selectedRoom.anomalyDetected && (
                <div className="flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 dark:bg-red-900/20">
                  <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-200">Anomaly</span>
                </div>
              )}

              {/* Stats */}
              <div className="ml-auto flex items-center gap-4 text-xs">
                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-400">Current</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRoom.currentOccupants}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-400">Capacity</p>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedRoom.capacity}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-600 dark:text-slate-400">Usage</p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {Math.round((selectedRoom.currentOccupants / selectedRoom.capacity) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CCTV Upload - Takes remaining space */}
        <Card className="flex-1 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upload Photo</CardTitle>
          </CardHeader>
          <CardContent className="h-full overflow-y-auto">
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
  )
}
