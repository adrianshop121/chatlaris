'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#128C7E] text-white shadow-lg mb-4">
          <MessageSquare className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Lupa Password</h1>
        <p className="mt-1 text-xs font-semibold text-[#128C7E] uppercase tracking-widest">
          ChatLaris — Pemulihan Akun
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          {isSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-[#25D366] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Email Pemulihan Terkirim</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Instruksi pemulihan kata sandi telah dikirimkan ke <span className="font-semibold text-gray-900">{email}</span>. Silakan periksa kotak masuk atau folder spam Anda.
              </p>
              <div className="pt-2">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full text-xs" icon={<ArrowLeft className="w-4 h-4" />}>
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Masukkan alamat email yang terdaftar pada akun ChatLaris Anda. Kami akan mengirimkan tautan reset kata sandi.
              </p>
              <Input
                label="Email"
                type="email"
                placeholder="nama@bisnis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
              <Button type="submit" variant="secondary" className="w-full py-2.5 mt-2" isLoading={isLoading}>
                Kirim Tautan Pemulihan
              </Button>
              <div className="pt-2 text-center">
                <Link href="/auth/login" className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Kembali ke halaman masuk
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
