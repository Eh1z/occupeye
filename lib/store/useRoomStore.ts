import { create } from 'zustand'

export interface LectureHall {
  id: string
  name: string
  capacity: number
  currentOccupants: number
  status: 'empty' | 'occupied' | 'overcrowded'
  manuallyScheduled: boolean
  anomalyDetected: boolean
  lastUpdated: number
  lastUpdatedBy?: 'manual' | 'simulation'
}

export interface ActivityLog {
  id: string
  timestamp: number
  roomId: string
  roomName: string
  eventType: 'occupancy_detected' | 'anomaly_detected' | 'schedule_changed' | 'cleared'
  message: string
  occupantCount?: number
}

interface RoomStoreState {
  rooms: Record<string, LectureHall>
  activityLog: ActivityLog[]

  // Actions
  initializeRooms: (halls: Omit<LectureHall, 'status' | 'anomalyDetected' | 'lastUpdated' | 'lastUpdatedBy'>[]) => void
  updateOccupancy: (roomId: string, occupantCount: number) => void
  setScheduled: (roomId: string, isScheduled: boolean) => void
  clearAnomaly: (roomId: string) => void
  addActivityLog: (event: Omit<ActivityLog, 'id'>) => void

  // Computed getters
  getTotalHalls: () => number
  getActiveOccupancy: () => number
  getAnomalyRate: () => number
  getRoomsByStatus: (status: LectureHall['status']) => LectureHall[]
  getRecentLogs: (count?: number) => ActivityLog[]
}

const computeStatus = (currentOccupants: number, capacity: number): LectureHall['status'] => {
  if (currentOccupants >= capacity) return 'overcrowded'
  if (currentOccupants > 0) return 'occupied'
  return 'empty'
}

const computeAnomaly = (occupants: number, scheduled: boolean): boolean => {
  return (scheduled && occupants === 0) || (!scheduled && occupants > 0)
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  rooms: {},
  activityLog: [],

  initializeRooms: (halls) => {
    const initialRooms: Record<string, LectureHall> = {}
    halls.forEach((hall) => {
      const status = computeStatus(hall.currentOccupants, hall.capacity)
      const anomalyDetected = computeAnomaly(hall.currentOccupants, hall.manuallyScheduled)
      initialRooms[hall.id] = {
        ...hall,
        status,
        anomalyDetected,
        lastUpdated: Date.now(),
        lastUpdatedBy: 'manual',
      }
    })
    set({ rooms: initialRooms })
  },

  updateOccupancy: (roomId, occupantCount) => {
    set((state) => {
      const room = state.rooms[roomId]
      if (!room) return state

      const newStatus = computeStatus(occupantCount, room.capacity)
      const newAnomaly = computeAnomaly(occupantCount, room.manuallyScheduled)
      const wasAnomaly = room.anomalyDetected

      const updatedRoom: LectureHall = {
        ...room,
        currentOccupants: occupantCount,
        status: newStatus,
        anomalyDetected: newAnomaly,
        lastUpdated: Date.now(),
        lastUpdatedBy: 'simulation',
      }

      const newRooms = { ...state.rooms, [roomId]: updatedRoom }

      // Create activity log entry
      const logEntry: ActivityLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        roomId,
        roomName: room.name,
        eventType: 'occupancy_detected',
        message: `${room.name}: ${occupantCount} persons detected`,
        occupantCount,
      }

      let newLogs = [logEntry, ...state.activityLog]
      if (newLogs.length > 100) {
        newLogs = newLogs.slice(0, 100)
      }

      // Add anomaly detection log if anomaly state changed
      if (newAnomaly && !wasAnomaly) {
        const anomalyLog: ActivityLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          roomId,
          roomName: room.name,
          eventType: 'anomaly_detected',
          message: `⚠️ Anomaly in ${room.name}: ${room.manuallyScheduled ? 'Scheduled but empty' : 'Unscheduled occupancy'}`,
        }
        newLogs = [anomalyLog, ...newLogs]
        if (newLogs.length > 100) {
          newLogs = newLogs.slice(0, 100)
        }
      }

      return { rooms: newRooms, activityLog: newLogs }
    })
  },

  setScheduled: (roomId, isScheduled) => {
    set((state) => {
      const room = state.rooms[roomId]
      if (!room) return state

      const newAnomaly = computeAnomaly(room.currentOccupants, isScheduled)
      const wasAnomaly = room.anomalyDetected

      const updatedRoom: LectureHall = {
        ...room,
        manuallyScheduled: isScheduled,
        anomalyDetected: newAnomaly,
        lastUpdated: Date.now(),
        lastUpdatedBy: 'manual',
      }

      const newRooms = { ...state.rooms, [roomId]: updatedRoom }

      const logEntry: ActivityLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        roomId,
        roomName: room.name,
        eventType: 'schedule_changed',
        message: `${room.name}: ${isScheduled ? 'Marked as scheduled' : 'Marked as unscheduled'}`,
      }

      let newLogs = [logEntry, ...state.activityLog]
      if (newLogs.length > 100) {
        newLogs = newLogs.slice(0, 100)
      }

      // Log anomaly change if needed
      if (newAnomaly && !wasAnomaly) {
        const anomalyLog: ActivityLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          roomId,
          roomName: room.name,
          eventType: 'anomaly_detected',
          message: `⚠️ Anomaly in ${room.name}: ${isScheduled ? 'Scheduled but empty' : 'Unscheduled occupancy'}`,
        }
        newLogs = [anomalyLog, ...newLogs]
        if (newLogs.length > 100) {
          newLogs = newLogs.slice(0, 100)
        }
      } else if (!newAnomaly && wasAnomaly) {
        const clearedLog: ActivityLog = {
          id: `log_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          roomId,
          roomName: room.name,
          eventType: 'cleared',
          message: `✓ Anomaly cleared in ${room.name}`,
        }
        newLogs = [clearedLog, ...newLogs]
        if (newLogs.length > 100) {
          newLogs = newLogs.slice(0, 100)
        }
      }

      return { rooms: newRooms, activityLog: newLogs }
    })
  },

  clearAnomaly: (roomId) => {
    set((state) => {
      const room = state.rooms[roomId]
      if (!room || !room.anomalyDetected) return state

      const updatedRoom: LectureHall = {
        ...room,
        anomalyDetected: false,
        lastUpdated: Date.now(),
        lastUpdatedBy: 'manual',
      }

      const newRooms = { ...state.rooms, [roomId]: updatedRoom }

      const logEntry: ActivityLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        roomId,
        roomName: room.name,
        eventType: 'cleared',
        message: `✓ Anomaly acknowledged in ${room.name}`,
      }

      let newLogs = [logEntry, ...state.activityLog]
      if (newLogs.length > 100) {
        newLogs = newLogs.slice(0, 100)
      }

      return { rooms: newRooms, activityLog: newLogs }
    })
  },

  addActivityLog: (event) => {
    set((state) => {
      const logEntry: ActivityLog = {
        id: `log_${Date.now()}_${Math.random()}`,
        ...event,
      }

      let newLogs = [logEntry, ...state.activityLog]
      if (newLogs.length > 100) {
        newLogs = newLogs.slice(0, 100)
      }

      return { activityLog: newLogs }
    })
  },

  getTotalHalls: () => {
    return Object.keys(get().rooms).length
  },

  getActiveOccupancy: () => {
    return Object.values(get().rooms).reduce((sum, room) => sum + room.currentOccupants, 0)
  },

  getAnomalyRate: () => {
    const rooms = Object.values(get().rooms)
    if (rooms.length === 0) return 0
    const anomalies = rooms.filter((r) => r.anomalyDetected).length
    return (anomalies / rooms.length) * 100
  },

  getRoomsByStatus: (status) => {
    return Object.values(get().rooms).filter((room) => room.status === status)
  },

  getRecentLogs: (count = 20) => {
    return get().activityLog.slice(0, count)
  },
}))
