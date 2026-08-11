'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Building, Link2, FileText, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { createBusinessOnboarding } = useAuth()
  const router = useRouter()

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-').slice(0, -1)) {
      const autoSlug = val
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
      setSlug(autoSlug)
    }
  }

  const handleSlugChange = (val: string) => {
    const clean = val
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
    setSlug(clean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama bisnis wajib diisi.')
      return
    }

    setIsLoading(true)
    const result = await createBusinessOnboarding(name, slug, description)
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
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Siapkan bisnis kamu
        </h1>
        <p className="mt-1 text-xs text-gray-600">
          Proses cepat kurang dari 2 menit untuk mulai mengelola penjualan WhatsApp.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-gray-100 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700 leading-relaxed">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Nama Bisnis"
              placeholder="Contoh: Toko Hijab Utama"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              leftIcon={<Building className="w-4 h-4" />}
              required
            />

            <Input
              label="Username / Slug Bisnis"
              placeholder="toko-hijab-utama"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              leftIcon={<Link2 className="w-4 h-4" />}
              helperText="Huruf kecil, angka, dan tanda hubung (-). Tanpa spasi."
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Deskripsi Singkat (Opsional)
              </label>
              <div className="relative">
                <textarea
                  className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
                  rows={3}
                  placeholder="Selling premium Muslimah fashion and accessories."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-sm font-bold shadow-md"
                isLoading={isLoading}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Lanjut ke Dashboard
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
