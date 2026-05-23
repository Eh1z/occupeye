'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, KeyRound } from 'lucide-react'
import AuthShell from '@/components/auth/AuthShell'
import PasswordField from '@/components/auth/PasswordField'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { CardDescription } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Missing reset token. Open the link from your reset email or server log.')
    }
  }, [token])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('token') ?? '')
  }, [token])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token) {
      setError('Missing reset token.')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    await authClient.resetPassword(
      {
        token,
        newPassword: password,
      },
      {
        onSuccess: () => {
          setMessage('Password reset successfully. You can sign in again now.')
          setLoading(false)
          router.push('/sign-in')
        },
        onError: (context) => {
          setError(context.error.message)
          setLoading(false)
        },
      }
    )
  }

  return (
    <AuthShell
      title="Set a new password"
      description="Use the token from your reset link to set a new password and sign back in."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <PasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          placeholder="Enter a new password"
          autoComplete="new-password"
        />

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <CardDescription className="text-sm text-red-600">{error}</CardDescription>}

        <Button type="submit" className="w-full gap-2" disabled={loading || !token}>
          <KeyRound className="h-4 w-4" />
          {loading ? 'Updating password...' : 'Reset password'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link href="/sign-in" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
            Back to sign in
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}