import { create } from 'zustand'

export interface Booking {
  id: string
  roomId: string
  className: string
  instructor: string
  bookedAt: number
  blockedUntil: number // Room unavailable for booking until this time (occupancy detection time + 2 hours)
}

export interface LectureHall {
  id: string
  name: string
  capacity: number
  currentOccupants: number
  status: 'empty' | 'occupied'
  lastOccupancyUpdate: number // When occupancy was last detected
  lastOccupancyUpdateBy: 'manual' | 'simulation'
  currentBooking: Booking | null // Current class booked in this room
  isBlockedForBooking: boolean // True if occupied or within 2 hour buffer
  blockedUntil: number // When room becomes available for booking
  anomalyDetected: boolean // Occupied but not booked
}

export interface ActivityLog {
  id: string
  timestamp: number
  roomId: string
  roomName: string
  eventType: 'occupancy_detected' | 'class_booked' | 'class_cancelled' | 'anomaly_detected' | 'room_available'
  message: string
  occupantCount?: number
}

interface RoomStoreState {
  rooms: Record<string, LectureHall>
  activityLog: ActivityLog[]

  // Initialization
  initializeRooms: (halls: Omit<LectureHall, 'status' | 'currentBooking' | 'isBlockedForBooking' | 'blockedUntil' | 'anomalyDetected' | 'lastOccupancyUpdate' | 'lastOccupancyUpdateBy'>[]) => void

  // Occupancy (from CCTV detection)
  updateOccupancy: (roomId: string, occupantCount: number) => void

  // Booking actions
  bookClass: (roomId: string, className: string, instructor: string) => void
  cancelBooking: (roomId: string, bookingId: string) => void

  // Computed getters
  getTotalHalls: () => number
  getOccupiedRooms: () => LectureHall[]
  getAvailableRooms: () => LectureHall[]
  getBlockedRooms: () => LectureHall[]
  getRecentLogs: (count?: number) => ActivityLog[]
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  rooms: {},
  activityLog: [],

  initializeRooms: (halls) => {
    const initialRooms: Record<string, LectureHall> = {}
    halls.forEach((hall) => {
      initialRooms[hall.id] = {
        ...hall,
        status: 'empty',
        currentBooking: null,
        isBlockedForBooking: false,
        blockedUntil: 0,
        anomalyDetected: false,
        lastOccupancyUpdate: Date.now(),
        lastOccupancyUpdateBy: 'manual',
      }
    })
    set({ rooms: initialRooms })
  },

  updateOccupancy: (roomId, occupantCount) => {
    set((state) => {
      const room = state.rooms[roomId]
      if (!room) return state

      const now = Date.now()
      const wasOccupied = room.status === 'occupied'
      const isNowOccupied = occupantCount > 0
      const blockedUntilTime = isNowOccupied ? now + TWO_HOURS_MS : now

      const newAnomaly = isNowOccupied && !room.currentBooking

      const updatedRoom: LectureHall = {
        ...room,
        currentOccupants: occupantCount,
        status: isNowOccupied ? 'occupied' : 'empty',
        lastOccupancyUpdate: now,
        lastOccupancyUpdateBy: 'simulation',
        isBlockedForBooking: isNowOccupied,
        blockedUntil: blockedUntilTime,
        anomalyDetected: newAnomaly,
      }

      const newRooms = { ...state.rooms, [roomId]: updatedRoom }
      let newLogs = [...state.activityLog]

      // Log occupancy change
      if (isNowOccupied !== wasOccupied) {
        const logEntry: ActivityLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: now,
          roomId,
          roomName: room.name,
          eventType: 'occupancy_detected',
          message: isNowOccupied
            ? `${room.name}: Occupied by ${occupantCount} persons. Available for booking in 2 hours.`
            : `${room.name}: Now empty. Available for immediate booking.`,
          occupantCount,
        }
        newLogs = [logEntry, ...newLogs]
      }

      // Log anomaly if unbooked occupancy detected
      if (newAnomaly && !room.anomalyDetected) {
        const anomalyLog: ActivityLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: now,
          roomId,
          roomName: room.name,
          eventType: 'anomaly_detected',
          message: `⚠️ ${room.name}: Occupied but NOT booked. Unexpected usage!`,
        }
        newLogs = [anomalyLog, ...newLogs]
      }

      if (newLogs.length > 100) newLogs = newLogs.slice(0, 100)

      return { rooms: newRooms, activityLog: newLogs }
    })
  },

  bookClass: (roomId, className, instructor) => {
    set((state) => {
      const room = state.rooms[roomId]
      if (!room) return state

      // Can't book if occupied or blocked
      if (room.isBlockedForBooking) {
        alert(`Cannot book: ${room.name} is blocked until ${new Date(room.blockedUntil).toLocaleTimeString()}`)
        return state
      }

      const now = Date.now()
      const booking: Booking = {
        id: `booking_${now}_${Math.random()}`,
        roomId,
        className,
        instructor,
        bookedAt: now,
        blockedUntil: room.blockedUntil,
      }

      const updatedRoom: LectureHall = {
        ...room,
        currentBooking: booking,
      }

      const logEntry: ActivityLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: now,
        roomId,
        roomName: room.name,
        eventType: 'class_booked',
        message: `📅 ${className} by ${instructor} booked in ${room.name}`,
      }

      let newLogs = [logEntry, ...state.activityLog]
      if (newLogs.length > 100) newLogs = newLogs.slice(0, 100)

      return {
        rooms: { ...state.rooms, [roomId]: updatedRoom },
        activityLog: newLogs,
      }
    })
  },

  cancelBooking: (roomId, bookingId) => {
    set((state) => {
      const room = state.rooms[roomId]
      if (!room || !room.currentBooking || room.currentBooking.id !== bookingId) return state

      const updatedRoom: LectureHall = {
        ...room,
        currentBooking: null,
      }

      const logEntry: ActivityLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        roomId,
        roomName: room.name,
        eventType: 'class_cancelled',
        message: `❌ ${room.currentBooking.className} cancelled in ${room.name}`,
      }

      let newLogs = [logEntry, ...state.activityLog]
      if (newLogs.length > 100) newLogs = newLogs.slice(0, 100)

      return {
        rooms: { ...state.rooms, [roomId]: updatedRoom },
        activityLog: newLogs,
      }
    })
  },

  getTotalHalls: () => {
    return Object.keys(get().rooms).length
  },

  getOccupiedRooms: () => {
    return Object.values(get().rooms).filter((r) => r.status === 'occupied')
  },

  getAvailableRooms: () => {
    return Object.values(get().rooms).filter((r) => !r.isBlockedForBooking)
  },

  getBlockedRooms: () => {
    return Object.values(get().rooms).filter((r) => r.isBlockedForBooking)
  },

  getRecentLogs: (count = 20) => {
    return get().activityLog.slice(0, count)
  },
}))
