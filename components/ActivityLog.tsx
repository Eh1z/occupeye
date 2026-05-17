'use client'

import { ActivityLog } from '@/lib/store/useRoomStore'
import { AlertTriangle, CheckCircle, Calendar, Users, BookOpen, XCircle } from 'lucide-react'

interface ActivityLogProps {
  logs: ActivityLog[]
}

export default function ActivityLogComponent({ logs }: ActivityLogProps) {
  const getEventIcon = (eventType: ActivityLog['eventType']) => {
    switch (eventType) {
      case 'occupancy_detected':
        return <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'anomaly_detected':
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'class_booked':
        return <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      case 'class_cancelled':
        return <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      case 'room_available':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      default:
        return <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
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
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Activity Log</h3>
      </div>

      <div className="max-h-96 divide-y divide-zinc-200 overflow-y-auto dark:divide-zinc-800">
        {logs.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No activity yet. Upload an image to get started.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-4 px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
            >
              <div className="flex-shrink-0 pt-1">{getEventIcon(log.eventType)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{log.roomName}</p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{log.message}</p>
                  </div>
                  {log.occupantCount !== undefined && (
                    <div className="flex-shrink-0 rounded-full bg-blue-50 px-3 py-1 dark:bg-blue-900/20">
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {log.occupantCount}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{formatTime(log.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
