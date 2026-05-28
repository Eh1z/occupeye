'use client'

import { Users, AlertTriangle, CheckCircle } from 'lucide-react'

interface MetricsCardProps {
  totalHalls: number
  occupiedHalls: number
  availableHalls: number
  readyHalls: number
}

export default function MetricsCard({ totalHalls, occupiedHalls, availableHalls, readyHalls }: MetricsCardProps) {
  const blockedHalls = totalHalls - occupiedHalls - availableHalls

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Available */}
      <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm dark:border-green-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">🟢 Available for Booking</p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{availableHalls}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">out of {totalHalls}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Lecture Ready */}
      <div className="rounded-lg border border-cyan-200 bg-white p-6 shadow-sm dark:border-cyan-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">🟦 Lecture Ready</p>
            <p className="mt-2 text-3xl font-bold text-cyan-600 dark:text-cyan-400">{readyHalls}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">rooms ready for lecture</p>
          </div>
          <div className="rounded-lg bg-cyan-50 p-3 dark:bg-cyan-900/20">
            <CheckCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Occupied */}
      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm dark:border-red-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">🔴 Currently Occupied</p>
            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">{occupiedHalls}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">people detected inside</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      {/* Blocked */}
      <div className="rounded-lg border border-amber-200 bg-white p-6 shadow-sm dark:border-amber-800 dark:bg-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">🟡 Blocked (2hr buffer)</p>
            <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">{blockedHalls}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">waiting for room to clear</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  )
}

