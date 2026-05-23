'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, KeyRound, ArrowRight } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import PasswordField from '@/components/auth/PasswordField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/sign-in')
    }
  }, [isPending, router, session])

  const handlePasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    await authClient.changePassword(
      {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
      {
        onSuccess: () => {
          setMessage('Password updated successfully.')
          setCurrentPassword('')
          setNewPassword('')
          setLoading(false)
        },
        onError: (context) => {
          setError(context.error.message)
          setLoading(false)
        },
      }
    )
  }

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push('/sign-in'),
      },
    })
  }

  if (!session) {
    return null
  }

  const role = session.user.role

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 px-4 py-8 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="border-slate-200/80 bg-white/95 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Shield className="h-5 w-5 text-blue-600" />
              Account settings
            </CardTitle>
            <CardDescription>Manage your profile and change your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="font-medium text-slate-900 dark:text-white">{session.user.name}</p>
              <p className="text-sm text-slate-500">{session.user.email}</p>
              <Badge variant={role === 'admin' ? 'default' : role === 'lecturer' ? 'secondary' : 'outline'} className="w-fit capitalize">
                {role}
              </Badge>
            </div>

            {role === 'admin' && (
              <Button asChild className="w-full justify-between">
                <Link href="/admin/users">
                  Open user admin
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white/95 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <KeyRound className="h-5 w-5 text-blue-600" />
              Change password
            </CardTitle>
            <CardDescription>Use your current password to set a new one.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handlePasswordChange}>
              <PasswordField
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Current password"
                autoComplete="current-password"
              />
              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="New password"
                autoComplete="new-password"
              />

              {message && <p className="text-sm text-green-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating password...' : 'Update password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}