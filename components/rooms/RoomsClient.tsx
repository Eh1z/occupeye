'use client'

import { useEffect, useState, useRef } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import CCTVTestbed from '@/components/CCTVTestbed'
import ActivityLogComponent from '@/components/ActivityLog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Circle, Shield, EyeOff } from 'lucide-react'
import type { AuthRole } from '@/lib/auth'

type InitialLectureHall = Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy' | 'equipment'> & {
  equipment?: string[]
}

const INITIAL_ROOMS: InitialLectureHall[] = [
  { id: 'room-a', name: 'Classroom A', capacity: 20, currentOccupants: 0 },
  { id: 'room-b', name: 'Classroom B', capacity: 30, currentOccupants: 0 },
  { id: 'room-c', name: 'Classroom C', capacity: 25, currentOccupants: 0 },
  { id: 'room-d', name: 'Classroom D', capacity: 35, currentOccupants: 0 },
  { id: 'room-e', name: 'Classroom E', capacity: 40, currentOccupants: 0 },
  { id: 'room-f', name: 'Classroom F', capacity: 28, currentOccupants: 0 },
]

type RoomsClientProps = {
  role: AuthRole
  userName?: string
}

export default function RoomsClient({ role, userName }: RoomsClientProps) {
  const store = useRoomStore()
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-a')
  const [bookingData, setBookingData] = useState({ className: '', instructor: '' })
  const [selectedRoomCheckMessage, setSelectedRoomCheckMessage] = useState<string | null>(null)
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
  const canBook = role === 'student' || role === 'lecturer' || role === 'admin'

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
                className={`w-full rounded-lg border-2 p-3 text-left transition-all ${selectedRoomId === room.id
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Circle
                      className={`h-3 w-3 fill-current ${room.status === 'occupied'
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
                      className={`h-3 w-3 fill-current ${selectedRoom.status === 'occupied'
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

              <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Lecture Hall Readiness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Equipment</p>
                      <p className="mt-2 text-sm text-slate-900 dark:text-white">
                        {selectedRoom.equipment.join(' · ')}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Lecture Ready</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedRoom.status === 'empty' && !selectedRoom.isBlockedForBooking && selectedRoom.equipment.includes('projector') && selectedRoom.equipment.includes('whiteboard') && selectedRoom.equipment.includes('audio')
                          ? 'Yes'
                          : 'No'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        const message = store.checkLectureHall(selectedRoom.id)
                        setSelectedRoomCheckMessage(message)
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Check Hall Status
                    </button>
                    {selectedRoomCheckMessage && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                        {selectedRoomCheckMessage}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {canBook ? (
                <div className="flex flex-1 flex-col gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Book Classroom</CardTitle>
                      <CardDescription>Reserve this classroom for a lecture or event.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedRoom.currentBooking ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Current Booking</p>
                          <p className="text-sm">{selectedRoom.currentBooking.className} — <span className="text-xs text-slate-600">{selectedRoom.currentBooking.instructor}</span></p>
                          {selectedRoom.currentBooking.bookedBy && (
                            <p className="text-xs text-slate-500">Booked by {selectedRoom.currentBooking.bookedBy}</p>
                          )}
                          <div className="flex gap-2">
                            {role === 'admin' && (
                              <button
                                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                                onClick={() => store.cancelBooking(selectedRoom.id, selectedRoom.currentBooking!.id)}
                              >
                                Cancel Booking
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-slate-600">Class name</label>
                            <input
                              value={bookingData.className}
                              onChange={(e) => setBookingData({ ...bookingData, className: e.target.value })}
                              className="mt-1 w-full rounded border px-2 py-1 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600">Instructor</label>
                            <input
                              value={bookingData.instructor}
                              onChange={(e) => setBookingData({ ...bookingData, instructor: e.target.value })}
                              className="mt-1 w-full rounded border px-2 py-1 text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                              onClick={() => {
                                if (!bookingData.className || !bookingData.instructor) {
                                  alert('Please fill class name and instructor')
                                  return
                                }
                                store.bookClass(selectedRoom.id, bookingData.className, bookingData.instructor, userName)
                                setBookingData({ className: '', instructor: '' })
                              }}
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {canManageRooms && (
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

                  {role === 'admin' && (
                    <div>
                      <ActivityLogComponent logs={store.getRecentLogs(20)} />
                    </div>
                  )}
                </div>
              ) : (
                <Card className="border-dashed border-blue-200 bg-blue-50/80 dark:border-blue-800 dark:bg-blue-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <EyeOff className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Student view
                    </CardTitle>
                    <CardDescription>
                      Students can review room availability only. Booking, CCTV, and occupancy changes are reserved for staff.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}