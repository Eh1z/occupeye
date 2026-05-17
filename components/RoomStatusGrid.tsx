'use client'

import { LectureHall, useRoomStore } from '@/lib/store/useRoomStore'
import { AlertTriangle, Check, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoomStatusGridProps {
  rooms: LectureHall[]
  selectedRoomId?: string
  onSelectRoom?: (roomId: string) => void
}

export default function RoomStatusGrid({ rooms, selectedRoomId, onSelectRoom }: RoomStatusGridProps) {
  const { setScheduled, clearAnomaly } = useRoomStore()

  const getStatusColor = (status: LectureHall['status']) => {
    switch (status) {
      case 'empty':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
      case 'occupied':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
      case 'overcrowded':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
    }
  }

  const getStatusBadgeColor = (status: LectureHall['status']) => {
    switch (status) {
      case 'empty':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
      case 'occupied':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200'
      case 'overcrowded':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return 'earlier'
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => onSelectRoom?.(room.id)}
          className={`flex flex-col gap-4 rounded-lg border-2 p-4 transition-all ${getStatusColor(room.status)} ${
            selectedRoomId === room.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
          } ${onSelectRoom ? 'cursor-pointer hover:shadow-md' : ''}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{room.name}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Capacity: {room.capacity}</p>
            </div>
            {room.anomalyDetected && (
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>

          {/* Occupancy Info */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{room.currentOccupants}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">/ {room.capacity} persons</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className={`h-full transition-all ${
                  room.status === 'overcrowded'
                    ? 'bg-red-500'
                    : room.status === 'occupied'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min((room.currentOccupants / room.capacity) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeColor(room.status)}`}>
              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
            </span>
            {room.manuallyScheduled && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                Scheduled
              </span>
            )}
          </div>

          {/* Anomaly Alert */}
          {room.anomalyDetected && (
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                ⚠️ {room.manuallyScheduled ? 'Scheduled but empty' : 'Unscheduled occupancy'}
              </p>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Clock className="h-3 w-3" />
            <span>Updated {formatTime(room.lastUpdated)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant={room.manuallyScheduled ? 'outline' : 'default'}
              onClick={(e) => {
                e.stopPropagation()
                setScheduled(room.id, !room.manuallyScheduled)
              }}
              className="flex-1 text-xs"
            >
              {room.manuallyScheduled ? 'Unschedule' : 'Schedule'}
            </Button>
            {room.anomalyDetected && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAnomaly(room.id)
                }}
                className="flex-1 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
