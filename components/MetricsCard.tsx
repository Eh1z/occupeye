'use client'

import { Users, AlertTriangle, LayoutGrid } from 'lucide-react'

interface MetricsCardProps {
  totalHalls: number
  activeOccupancy: number
  anomalyRate: number
}

export default function MetricsCard({ totalHalls, activeOccupancy, anomalyRate }: MetricsCardProps) {
  const getAnomalyColor = (rate: number) => {
    if (rate === 0) return 'text-green-600 dark:text-green-400'
    if (rate < 25) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getAnomalyBgColor = (rate: number) => {
    if (rate === 0) return 'bg-green-50 dark:bg-green-900/20'
    if (rate < 25) return 'bg-amber-50 dark:bg-amber-900/20'
    return 'bg-red-50 dark:bg-red-900/20'
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Total Halls */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Halls</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{totalHalls}</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <LayoutGrid className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Active Occupancy */}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Total Occupancy</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{activeOccupancy}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">persons across all halls</p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {/* Anomaly Rate */}
      <div className={`rounded-lg border border-zinc-200 p-6 shadow-sm dark:border-zinc-800 ${getAnomalyBgColor(anomalyRate)}`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Anomaly Rate</p>
            <p className={`mt-2 text-3xl font-bold ${getAnomalyColor(anomalyRate)}`}>{anomalyRate.toFixed(1)}%</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">of halls with anomalies</p>
          </div>
          <div className={`rounded-lg p-3 ${getAnomalyBgColor(anomalyRate)}`}>
            <AlertTriangle className={`h-6 w-6 ${getAnomalyColor(anomalyRate)}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
