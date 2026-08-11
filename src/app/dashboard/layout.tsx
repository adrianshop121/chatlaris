'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { Sidebar } from '@/components/shell/sidebar'
import { Topbar } from '@/components/shell/topbar'
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, business, isLoading } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/login')
      } else if (!business) {
        router.push('/onboarding')
      }
    }
  }, [user, business, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] p-6 lg:pl-72 lg:pt-8">
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Desktop Sidebar & Mobile Drawer */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Wrapper */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
