'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Mohon isi email dan password.')
      return
    }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#128C7E] text-white shadow-lg mb-4">
          <MessageSquare className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">ChatLaris</h1>
        <p className="mt-1 text-xs font-semibold text-[#128C7E] uppercase tracking-widest">
          AI yang jual, kamu yang terima ordernya.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Masuk ke Akun Kamu
          </h2>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 leading-relaxed">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="nama@bisnis.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#128C7E] focus:ring-[#128C7E] mr-2"
                  defaultChecked
                />
                Ingat saya
              </label>

              <Link
                href="/auth/forgot-password"
                className="font-semibold text-[#128C7E] hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-2.5 mt-2"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-500">Atau masuk dengan</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs font-semibold py-2.5"
                onClick={() => {
                  alert('Integrasi Google Auth memerlukan provider Supabase aktif.')
                }}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Lanjutkan dengan Google
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-600">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="font-bold text-[#128C7E] hover:underline">
                Daftar gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
