'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ComingSoonModal } from '@/components/ui/coming-soon-modal'
import {
  MessageSquare,
  ShoppingBag,
  DollarSign,
  Star,
  Bot,
  Zap,
  PlusCircle,
  Smartphone,
  CheckCircle2,
  Inbox,
  ArrowUpRight,
} from 'lucide-react'

export default function DashboardHomePage() {
  const { profile, user, business, usage } = useAuth()

  const [modalState, setModalState] = useState<{ open: boolean; title: string; desc: string }>({
    open: false,
    title: '',
    desc: '',
  })

  const openComingSoon = (title: string, desc: string) => {
    setModalState({ open: true, title, desc })
  }

  const statCards = [
    {
      title: 'Chat Hari Ini',
      value: usage?.chats_count && usage.chats_count > 0 ? usage.chats_count : 'Belum ada data',
      subtext: 'Pesan masuk dari calon customer',
      icon: <MessageSquare className="w-5 h-5 text-[#128C7E]" />,
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Order Baru',
      value: usage?.orders_count && usage.orders_count > 0 ? usage.orders_count : 'Belum ada data',
      subtext: 'Pesanan terkonfirmasi hari ini',
      icon: <ShoppingBag className="w-5 h-5 text-sky-600" />,
      bgColor: 'bg-sky-50',
    },
    {
      title: 'Revenue Hari Ini',
      value: 'Belum ada data',
      subtext: 'Total nominal omset masuk',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'CSAT (Kepuasan Pelanggan)',
      value: 'Belum ada data',
      subtext: 'Rating rata-rata dari pembeli',
      icon: <Star className="w-5 h-5 text-amber-500" />,
      bgColor: 'bg-amber-50',
    },
  ]

  const quickActions = [
    {
      title: 'Latih AI',
      desc: 'Siapkan AI untuk membantu menjawab customer.',
      icon: <Bot className="w-5 h-5 text-[#128C7E]" />,
      action: () =>
        openComingSoon('Latih AI', 'Fitur Pelatihan AI Agent WhatsApp akan tersedia pada Phase 2.'),
    },
    {
      title: 'Tambah Produk',
      desc: 'Tambahkan produk pertama kamu.',
      icon: <PlusCircle className="w-5 h-5 text-[#25D366]" />,
      action: () =>
        openComingSoon('Tambah Produk', 'Katalog & Manajemen Produk akan dibuka pada Phase 2.'),
    },
    {
      title: 'Hubungkan WhatsApp',
      desc: 'Hubungkan WhatsApp untuk mulai menerima chat.',
      icon: <Smartphone className="w-5 h-5 text-sky-600" />,
      action: () =>
        openComingSoon(
          'Hubungkan WhatsApp',
          'Integrasi API WhatsApp Gateway resmi akan segera tersedia.'
        ),
    },
  ]

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#128C7E] to-[#0e7065] text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 text-emerald-200 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#25D366]" />
            <span>ChatLaris Phase 1 Foundation Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {profile?.full_name || user?.email?.split('@')[0] || 'Seller'}! 👋
          </h1>

          <p className="text-sm text-emerald-100/90 leading-relaxed pt-1">
            Pantau jualan dan aktivitas bisnis <span className="font-bold underline decoration-[#25D366]">{business?.name}</span> kamu dari sini.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Performa Bisnis</h2>
          <span className="text-xs text-gray-500 font-medium">Data Realtime</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <Card key={idx} className="hover:border-gray-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>{stat.icon}</div>
              </div>

              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] text-gray-500 font-medium">{stat.subtext}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (AI Status & Quick Actions) */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Agent Status Card */}
          <Card className="border-emerald-200 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/50">
            <CardHeader className="border-b-0 pb-0">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#128C7E] text-white rounded-xl shadow-sm">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle>AI Agent</CardTitle>
                    <Badge variant="warning" size="sm">
                      Belum diaktifkan
                    </Badge>
                  </div>
                  <CardDescription>
                    Latih AI kamu dengan informasi bisnis, FAQ, produk, dan SOP.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-emerald-100/60 mt-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Asisten AI akan menjawab pertanyaan customer 24/7 secara otomatis setelah dihubungkan.
              </p>
              <Button
                variant="primary"
                size="md"
                className="shrink-0 font-bold"
                onClick={() =>
                  openComingSoon(
                    'Latih AI Kamu',
                    'Asisten AI Agent ChatLaris akan tersedia untuk dilatih pada Phase 2.'
                  )
                }
              >
                Latih AI Kamu
              </Button>
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>Langkah awal untuk memulai penjualan dengan ChatLaris</CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((act, idx) => (
                <div
                  key={idx}
                  onClick={act.action}
                  className="p-4 rounded-xl border border-gray-200 hover:border-[#128C7E] hover:bg-emerald-50/30 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-gray-50 group-hover:bg-white rounded-lg transition-colors">
                        {act.icon}
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#128C7E] transition-colors" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#128C7E] transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{act.desc}</p>
                  </div>

                  <div className="pt-3">
                    <span className="text-[11px] font-semibold text-[#128C7E]">
                      Segera hadir &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Alerts & Recent Activity) */}
        <div className="space-y-6">
          {/* Alert Section (Section 20) */}
          <Card>
            <CardHeader>
              <CardTitle>Pekerjaan Pending</CardTitle>
              <CardDescription>Chat, order, dan follow-up yang memerlukan tindakan</CardDescription>
            </CardHeader>

            <div className="py-2 text-center">
              <div className="w-12 h-12 bg-emerald-100 text-[#25D366] rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Semua aman 🎉</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Belum ada pekerjaan yang perlu kamu tindak lanjuti.
              </p>
            </div>
          </Card>

          {/* Recent Activity (Section 19) */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
              <CardDescription>Riwayat interaksi dan pesanan terbaru</CardDescription>
            </CardHeader>

            <EmptyState
              title="Belum ada aktivitas"
              description="Aktivitas bisnis kamu akan muncul di sini setelah toko aktif."
              icon={<Inbox className="w-8 h-8 text-gray-400" />}
            />
          </Card>
        </div>
      </div>

      {/* Modal Placeholder */}
      <ComingSoonModal
        isOpen={modalState.open}
        onClose={() => setModalState({ open: false, title: '', desc: '' })}
        featureName={modalState.title}
        description={modalState.desc}
      />
    </div>
  )
}
