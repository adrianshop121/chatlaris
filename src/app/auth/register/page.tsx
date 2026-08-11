'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, User, Mail, Lock, Building, CheckCircle2, ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const validate = () => {
    const errs: { [key: string]: string } = {}

    if (!fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi.'
    if (!email.trim()) {
      errs.email = 'Email wajib diisi.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Format email tidak valid.'
    }

    if (!password) {
      errs.password = 'Password wajib diisi.'
    } else if (password.length < 6) {
      errs.password = 'Password minimal 6 karakter.'
    }

    if (!businessName.trim()) {
      errs.businessName = 'Nama bisnis wajib diisi.'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validate()) return

    setIsLoading(true)
    const result = await register(fullName, email, password, businessName)
    setIsLoading(false)

    if (result.error) {
      setFormError(result.error)
    } else {
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#128C7E] text-white shadow-lg mb-4">
          <MessageSquare className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Mulai jualan lebih rapi dengan ChatLaris
        </h1>
        <p className="mt-2 text-xs font-semibold text-[#128C7E] uppercase tracking-widest">
          AI yang jual, kamu yang terima ordernya.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-[#25D366] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Registrasi Berhasil! 🎉</h3>
              <p className="text-sm text-gray-600">
                Akun dan bisnis <span className="font-semibold text-gray-900">{businessName}</span> telah berhasil dibuat. Membuka Dashboard...
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-5 text-center">
                Daftar Akun & Bisnis Baru
              </h2>

              {formError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 leading-relaxed">
                  {formError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Nama"
                  placeholder="Ahmad Seller"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="ahmad@tokobisnis.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  leftIcon={<Lock className="w-4 h-4" />}
                  helperText="Minimal 6 karakter"
                  required
                />

                <Input
                  label="Nama Bisnis"
                  placeholder="Toko Fashion Berkah"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  error={errors.businessName}
                  leftIcon={<Building className="w-4 h-4" />}
                  helperText="Dapat diubah kapan saja di Pengaturan"
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-sm font-bold shadow-md"
                    isLoading={isLoading}
                    icon={<ArrowRight className="w-4 h-4" />}
                  >
                    Mulai Gratis
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center border-t border-gray-100 pt-4">
                <p className="text-xs text-gray-600">
                  Sudah punya akun?{' '}
                  <Link href="/auth/login" className="font-bold text-[#128C7E] hover:underline">
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
