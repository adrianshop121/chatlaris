'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { MessageSquare, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col justify-center items-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6">
        <div className="w-16 h-16 bg-[#128C7E] text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <MessageSquare className="w-9 h-9 fill-current" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ChatLaris</h1>
          <p className="text-xs font-bold text-[#128C7E] uppercase tracking-widest">
            AI yang jual, kamu yang terima ordernya.
          </p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Platform AI Sales Management WhatsApp terdepan untuk UMKM, Online Sellers, Reseller, dan Dropshipper Indonesia.
        </p>

        <div className="space-y-3 pt-2">
          <Link href="/auth/register" className="block w-full">
            <Button variant="primary" className="w-full py-3 font-bold text-sm" icon={<ArrowRight className="w-4 h-4" />}>
              Mulai Gratis Sekarang
            </Button>
          </Link>
          <Link href="/auth/login" className="block w-full">
            <Button variant="outline" className="w-full py-2.5 text-xs font-semibold">
              Sudah Memiliki Akun? Masuk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
