'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, UserPlus } from 'lucide-react'
import AuthShell from '@/components/auth/AuthShell'
import PasswordField from '@/components/auth/PasswordField'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CardDescription } from '@/components/ui/card'

export default function SignUpPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'lecturer'>('student')
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

    await authClient.signUp.email(
      {
        name,
        email,
        password,
        requestedRole: role,
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
      title="Create your account"
      description="Choose the role that matches your access. Students get the lightweight view, lecturers get room and CCTV controls, and admins can change roles later."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        </div>

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
          placeholder="Create a strong password"
          autoComplete="new-password"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Role</label>
          <Select value={role} onValueChange={(value) => setRole(value as 'student' | 'lecturer')}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="lecturer">Lecturer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && <CardDescription className="text-sm text-red-600">{error}</CardDescription>}

        <Button type="submit" className="w-full gap-2" disabled={loading || isPending}>
          <UserPlus className="h-4 w-4" />
          {loading ? 'Creating account...' : 'Create account'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <Link href="/sign-in" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
            Back to sign in
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-slate-500">Admins can update your role later.</span>
        </div>
      </form>
    </AuthShell>
  )
}