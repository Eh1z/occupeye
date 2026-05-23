'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, LogIn } from 'lucide-react'
import AuthShell from '@/components/auth/AuthShell'
import PasswordField from '@/components/auth/PasswordField'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CardDescription } from '@/components/ui/card'

export default function SignInPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      router.replace('/')
    }
  }, [router, session])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          router.push('/')
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
      title="Sign in to your dashboard"
      description="Access the right view for your role. Students see the essentials, lecturers get operational tools, and admins can manage access later."
    >
      <form className="space-y-5 w-full" onSubmit={handleSubmit}>
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

        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        {error && <CardDescription className="text-sm text-red-600">{error}</CardDescription>}

        <Button type="submit" className="w-full gap-2" disabled={loading || isPending}>
          <LogIn className="h-4 w-4" />
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link href="/sign-up" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
            Create an account
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-slate-500">Need admin access later? Ask an admin to update your role.</span>
        </div>
      </form>
    </AuthShell>
  )
}