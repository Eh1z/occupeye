'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Mail } from 'lucide-react'
import AuthShell from '@/components/auth/AuthShell'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CardDescription } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    await authClient.requestPasswordReset(
      {
        email,
        redirectTo: '/reset-password',
      },
      {
        onSuccess: () => {
          setMessage('If the email exists, a reset link has been generated. Check the server logs in development.')
          setLoading(false)
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
      title="Reset your password"
      description="Request a reset link for your account. In development, the link is logged on the server until a mail provider is configured."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@school.edu"
            autoComplete="email"
            required
          />
        </div>

        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <CardDescription className="text-sm text-red-600">{error}</CardDescription>}

        <Button type="submit" className="w-full gap-2" disabled={loading}>
          <Mail className="h-4 w-4" />
          {loading ? 'Sending reset link...' : 'Send reset link'}
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