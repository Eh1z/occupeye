'use client'

import { useEffect, useState, useRef } from 'react'
import { useRoomStore, type LectureHall } from '@/lib/store/useRoomStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Bookmark, LogsIcon, CheckCircle, Shield } from 'lucide-react'
import type { AuthRole } from '@/lib/auth'

type InitialLectureHall = Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy' | 'equipment'> & {
  equipment?: string[]
}

const INITIAL_ROOMS: InitialLectureHall[] = [
  { id: 'room-a', name: 'Room A', capacity: 20, currentOccupants: 0 },
  { id: 'room-b', name: 'Room B', capacity: 30, currentOccupants: 0 },
  { id: 'room-c', name: 'Room C', capacity: 25, currentOccupants: 0 },
  { id: 'room-d', name: 'Room D', capacity: 35, currentOccupants: 0 },
  { id: 'room-e', name: 'Room E', capacity: 40, currentOccupants: 0 },
  { id: 'room-f', name: 'Room F', capacity: 28, currentOccupants: 0 },
]

type LogsClientProps = {
  role: AuthRole
}

export default function LogsClient({ role }: LogsClientProps) {
  const store = useRoomStore()
  const [filterRoom, setFilterRoom] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')
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

  const logs = store.getRecentLogs(100)
  const rooms = Object.values(store.rooms)

  let filteredLogs = logs
  if (filterRoom) {
    filteredLogs = filteredLogs.filter((log) => log.roomId === filterRoom)
  }
  if (filterType) {
    filteredLogs = filteredLogs.filter((log) => log.eventType === filterType)
  }
  if (searchText) {
    filteredLogs = filteredLogs.filter((log) =>
      log.message.toLowerCase().includes(searchText.toLowerCase())
    )
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'anomaly_detected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'class_booked':
        return <Bookmark className="h-4 w-4 text-blue-500" />
      case 'room_available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'lecture_hall_checked':
        return <LogsIcon className="h-4 w-4 text-cyan-500" />
      default:
        return <LogsIcon className="h-4 w-4 text-slate-500" />
    }
  }

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'occupancy_detected':
        return <Badge variant="secondary">Occupancy</Badge>
      case 'anomaly_detected':
        return <Badge variant="destructive">Anomaly</Badge>
      case 'class_booked':
        return <Badge variant="default">Booked</Badge>
      case 'class_cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      case 'room_available':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Available</Badge>
      case 'lecture_hall_checked':
        return <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">Lecture Check</Badge>
      default:
        return <Badge>{eventType}</Badge>
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Activity Logs</h1>
            <Badge variant="secondary" className="capitalize">
              <Shield className="mr-1 h-3 w-3" />
              {role}
            </Badge>
          </div>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Complete history of all events</p>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto container space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search</label>
                <Input
                  placeholder="Search messages..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Room</label>
                <Select value={filterRoom} onValueChange={(value) => setFilterRoom(value || '')}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All rooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Rooms</SelectItem>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Event Type</label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value || '')}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Events</SelectItem>
                    <SelectItem value="occupancy_detected">Occupancy Detected</SelectItem>
                    <SelectItem value="anomaly_detected">Anomaly Detected</SelectItem>
                    <SelectItem value="class_booked">Class Booked</SelectItem>
                    <SelectItem value="class_cancelled">Class Cancelled</SelectItem>
                    <SelectItem value="room_available">Room Available</SelectItem>
                    <SelectItem value="lecture_hall_checked">Lecture Readiness Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>{filteredLogs.length} events found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {formatTime(log.timestamp)}
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-white">
                            {log.roomName}
                          </TableCell>
                          <TableCell>{getEventBadge(log.eventType)}</TableCell>
                          <TableCell className="max-w-sm text-slate-700 dark:text-slate-300">
                            {log.message}
                          </TableCell>
                          <TableCell className="text-right">
                            {log.occupantCount !== undefined ? (
                              <span className="font-medium text-slate-900 dark:text-white">
                                {log.occupantCount}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                          No events found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}