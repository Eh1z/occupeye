'use client'

import { useState } from 'react'
import { LectureHall, useRoomStore, type ScheduledClass } from '@/lib/store/useRoomStore'
import { Button } from '@/components/ui/button'
import { X, Plus, Clock } from 'lucide-react'

interface SchedulingModalProps {
  room: LectureHall
  onClose: () => void
}

export default function SchedulingModal({ room, onClose }: SchedulingModalProps) {
  const { addScheduledClass, removeScheduledClass } = useRoomStore()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    className: '',
    instructor: '',
    expectedOccupancy: Math.round(room.capacity * 0.7),
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    recurrence: 'none' as const,
    notes: '',
  })

  const handleAddClass = () => {
    if (!formData.className || !formData.instructor) {
      alert('Please fill in class name and instructor')
      return
    }

    const startTime = new Date(formData.startTime).getTime()
    const endTime = new Date(formData.endTime).getTime()

    if (startTime >= endTime) {
      alert('End time must be after start time')
      return
    }

    addScheduledClass(room.id, {
      className: formData.className,
      instructor: formData.instructor,
      startTime,
      endTime,
      expectedOccupancy: formData.expectedOccupancy,
      recurrence: formData.recurrence as any,
      notes: formData.notes || undefined,
    })

    setFormData({
      className: '',
      instructor: '',
      expectedOccupancy: Math.round(room.capacity * 0.7),
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      recurrence: 'none',
      notes: '',
    })
    setShowForm(false)
  }

  const isClassHappening = (classItem: ScheduledClass) => {
    const now = Date.now()
    return now >= classItem.startTime && now <= classItem.endTime
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            📅 Schedule for {room.name}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-6">
          {/* Current Classes */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-slate-900 dark:text-white">Scheduled Classes</h3>
            {room.scheduledClasses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No classes scheduled yet</p>
            ) : (
              <div className="space-y-2">
                {room.scheduledClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className={`rounded-lg border p-3 ${
                      isClassHappening(cls)
                        ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">{cls.className}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{cls.instructor}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Clock className="h-3 w-3" />
                          {new Date(cls.startTime).toLocaleTimeString()} - {new Date(cls.endTime).toLocaleTimeString()}
                        </div>
                        {cls.notes && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">📝 {cls.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeScheduledClass(room.id, cls.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Class Form */}
          {showForm && (
            <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
              <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">Add New Class</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Class Name *</label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Physics 101"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Instructor *</label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Dr. Smith"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Expected Occupancy</label>
                  <input
                    type="number"
                    min="1"
                    max={room.capacity}
                    value={formData.expectedOccupancy}
                    onChange={(e) => setFormData({ ...formData, expectedOccupancy: parseInt(e.target.value) })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Recurrence</label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as any })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="none">One-time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Notes (optional)</label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    placeholder="e.g., Lab session"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddClass} className="flex-1 bg-green-600 hover:bg-green-700">
                    Add Class
                  </Button>
                  <Button
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-4 dark:border-slate-700">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add New Class
            </Button>
          ) : (
            <Button onClick={() => setShowForm(false)} variant="outline" className="w-full">
              Cancel
            </Button>
          )}
          <Button onClick={onClose} variant="outline" className="mt-2 w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
