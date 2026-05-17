'use client'

import { useState } from 'react'
import { LectureHall, useRoomStore } from '@/lib/store/useRoomStore'
import { AlertTriangle, Clock, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoomStatusGridProps {
  rooms: LectureHall[]
  selectedRoomId?: string
  onSelectRoom?: (roomId: string) => void
}

export default function RoomStatusGrid({ rooms, selectedRoomId, onSelectRoom }: RoomStatusGridProps) {
  const { bookClass, cancelBooking } = useRoomStore()
  const [bookingRoom, setBookingRoom] = useState<string | null>(null)
  const [bookingData, setBookingData] = useState({ className: '', instructor: '' })

  const handleBook = (roomId: string) => {
    if (!bookingData.className || !bookingData.instructor) {
      alert('Please enter class name and instructor')
      return
    }
    bookClass(roomId, bookingData.className, bookingData.instructor)
    setBookingData({ className: '', instructor: '' })
    setBookingRoom(null)
  }

  const formatTimeRemaining = (blockedUntil: number) => {
    const now = Date.now()
    const remaining = blockedUntil - now
    if (remaining <= 0) return 'Available now'
    const minutes = Math.ceil(remaining / 60000)
    if (minutes < 60) return `Available in ${minutes}m`
    const hours = Math.ceil(remaining / 3600000)
    return `Available in ${hours}h`
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            onClick={() => onSelectRoom?.(room.id)}
            className={`flex flex-col gap-4 rounded-lg border-2 p-4 transition-all ${
              room.status === 'occupied'
                ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                : room.isBlockedForBooking
                  ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20'
                  : 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
            } ${selectedRoomId === room.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''} ${
              onSelectRoom ? 'cursor-pointer hover:shadow-md' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{room.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Capacity: {room.capacity}</p>
              </div>
              {room.anomalyDetected && (
                <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30" title="Occupied but not booked">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    room.status === 'occupied'
                      ? 'bg-red-500'
                      : room.isBlockedForBooking
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                  }`}
                />
                <span className="font-bold text-slate-900 dark:text-slate-50">
                  {room.status === 'occupied'
                    ? '🔴 OCCUPIED'
                    : room.isBlockedForBooking
                      ? '🟡 BLOCKED'
                      : '🟢 AVAILABLE'}
                </span>
              </div>

              {/* Current Occupancy */}
              {room.currentOccupants > 0 && (
                <div className="text-sm text-slate-700 dark:text-slate-300">
                  {room.currentOccupants} / {room.capacity} persons present
                </div>
              )}

              {/* Booking Block Time */}
              {room.isBlockedForBooking && (
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(room.blockedUntil)}
                </div>
              )}
            </div>

            {/* Current Booking */}
            {room.currentBooking && (
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  📅 {room.currentBooking.className}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{room.currentBooking.instructor}</p>
              </div>
            )}

            {/* Booking Form */}
            {bookingRoom === room.id ? (
              <div className="space-y-2 rounded-lg border-2 border-blue-300 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20">
                <input
                  type="text"
                  placeholder="Class name (e.g., Physics 101)"
                  value={bookingData.className}
                  onChange={(e) => setBookingData({ ...bookingData, className: e.target.value })}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Instructor (e.g., Dr. Smith)"
                  value={bookingData.instructor}
                  onChange={(e) => setBookingData({ ...bookingData, instructor: e.target.value })}
                  className="w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleBook(room.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Book Now
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBookingRoom(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                {room.isBlockedForBooking ? (
                  <div className="w-full rounded-lg bg-slate-200 p-2 text-center text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                    Blocked for 2 hours
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setBookingRoom(room.id)
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Book Class
                  </Button>
                )}
                {room.currentBooking && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      cancelBooking(room.id, room.currentBooking!.id)
                    }}
                    className="text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
