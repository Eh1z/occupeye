'use client'

// This component is no longer used in the new multi-page layout
// Kept for reference but not actively used

import { LectureHall } from '@/lib/store/useRoomStore'

interface SchedulingModalProps {
  room: LectureHall
  onClose: () => void
}

export default function SchedulingModal({ room, onClose }: SchedulingModalProps) {
  return null
}
