'use client'

import type { ReactNode } from 'react'
import { Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type AuthShellProps = {
  title: string
  description: string
  children: ReactNode
}

export default function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full container items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-semibold tracking-tight">OccupEye</p>
                  <p className="text-sm text-slate-300">Role-aware lecture hall control</p>
                </div>
              </div>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{description}</p>
            </div>

            <div className="mt-10 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Self-declared student and lecturer roles</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Admin access for role changes later</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">MongoDB-backed sessions and accounts</div>
            </div>
          </div>

          <Card className="border-slate-200/80 bg-white/95 text-slate-900 shadow-2xl shadow-black/20">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}