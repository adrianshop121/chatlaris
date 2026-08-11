'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ComingSoonModal } from '@/components/ui/coming-soon-modal'
import {
  Building2,
  Smartphone,
  Users,
  Bell,
  CreditCard,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react'

export default function SettingsPage() {
  const { business, membership, user, profile, subscription, updateBusinessProfile } = useAuth()

  const [activeTab, setActiveTab] = useState<'profile' | 'whatsapp' | 'team' | 'notifications' | 'billing'>('profile')

  // Business profile form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [timezone, setTimezone] = useState('Asia/Jakarta')

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Coming soon modal
  const [comingSoon, setComingSoon] = useState<{ open: boolean; title: string }>({
    open: false,
    title: '',
  })

  // Notification toggles state
  const [notifBrowser, setNotifBrowser] = useState(true)
  const [notifChat, setNotifChat] = useState(true)
  const [notifOrder, setNotifOrder] = useState(true)
  const [notifLead, setNotifLead] = useState(false)

  useEffect(() => {
    if (business) {
      setName(business.name || '')
      setSlug(business.slug || '')
      setDescription(business.description || '')
      setPhone(business.phone || '')
      setEmail(business.email || '')
      setAddress(business.address || '')
      setTimezone(business.timezone || 'Asia/Jakarta')
    }
  }, [business])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(false)
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage('Nama bisnis wajib diisi.')
      return
    }

    setIsSaving(true)
    const res = await updateBusinessProfile({
      name,
      slug,
      description,
      phone,
      email,
      address,
      timezone,
    })
    setIsSaving(false)

    if (res.error) {
      setErrorMessage(res.error)
    } else {
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profil Bisnis', icon: <Building2 className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'Nomor WhatsApp', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'team', label: 'Tim & Admin', icon: <Users className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifikasi', icon: <Bell className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pengaturan Bisnis</h1>
        <p className="text-xs text-gray-500 mt-1">
          Kelola informasi toko, keanggotaan tim, notifikasi, dan langganan ChatLaris.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-[#128C7E] space-x-6 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 border-b-2 text-xs font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#128C7E] text-[#128C7E]'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* TAB 1: PROFIL BISNIS (FUNCTIONAL) */}
      {activeTab === 'profile' && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Informasi Profil Bisnis</CardTitle>
            <CardDescription>
              Perbarui identitas dan informasi kontak bisnis Anda yang tersimpan di Supabase.
            </CardDescription>
          </CardHeader>

          {saveSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
              <span>Profil bisnis berhasil diperbarui dan tersimpan!</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Bisnis"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<Building2 className="w-4 h-4" />}
                required
              />

              <Input
                label="Username / Slug Bisnis"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                leftIcon={<Globe className="w-4 h-4" />}
                helperText="Digunakan untuk identifikasi unik bisnis."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Deskripsi Bisnis
              </label>
              <textarea
                className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
                rows={3}
                placeholder="Deskripsikan jualan atau produk usaha Anda..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon / WA Bisnis"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />

              <Input
                label="Email Bisnis"
                type="email"
                placeholder="kontak@bisnis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Alamat Bisnis"
              placeholder="Jl. Sudirman No. 123, Jakarta"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Zona Waktu (Timezone)
              </label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-sm rounded-lg border border-gray-300 p-2.5 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
                >
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <Button
                type="submit"
                variant="secondary"
                isLoading={isSaving}
                icon={<Save className="w-4 h-4" />}
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: NOMOR WHATSAPP (COMING SOON) */}
      {activeTab === 'whatsapp' && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Integrasi WhatsApp</CardTitle>
            <CardDescription>Hubungkan akun WhatsApp Business Anda dengan ChatLaris.</CardDescription>
          </CardHeader>

          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-[#128C7E] rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-gray-900">Segera Hadir di Phase berikutnya! 🚀</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Integrasi WhatsApp resmi akan tersedia pada tahap berikutnya. Anda akan dapat memindai QR Code untuk menghubungkan nomor WA Anda secara otomatis.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: TIM & ADMIN */}
      {activeTab === 'team' && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Anggota Tim & Role</CardTitle>
            <CardDescription>
              Daftar anggota tim yang memiliki akses ke bisnis <span className="font-bold">{business?.name}</span>.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-50 flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <span>Anggota</span>
                <span>Role / Status</span>
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={profile?.full_name || user?.email || 'Owner'} size="md" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">
                      {profile?.full_name || 'Pemilik Bisnis'}
                    </p>
                    <p className="text-[11px] text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="success" size="md">
                    Owner
                  </Badge>
                  <Badge variant="info" size="sm">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-semibold">Fitur Undang Anggota Tim</p>
              <p className="text-amber-700">
                Sistem undangan anggota baru (Admin/Staff) akan diaktifkan pada fase mendatang.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: NOTIFIKASI */}
      {activeTab === 'notifications' && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Pengaturan Notifikasi</CardTitle>
            <CardDescription>Pilih notifikasi yang ingin Anda terima.</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            {[
              { title: 'Notifikasi Browser', desc: 'Terima notifikasi langsung di browser saat pesan baru masuk.', state: notifBrowser, set: setNotifBrowser },
              { title: 'Notifikasi Chat Masuk', desc: 'Pemberitahuan ketika ada customer memulai percakapan baru.', state: notifChat, set: setNotifChat },
              { title: 'Notifikasi Order Baru', desc: 'Pemberitahuan ketika ada transaksi/pesanan berhasil dibuat.', state: notifOrder, set: setNotifOrder },
              { title: 'Notifikasi Lead / Lead Baru', desc: 'Pemberitahuan ketika AI mengidentifikasi calon pembeli potensial.', state: notifLead, set: setNotifLead },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-xl border border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{n.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={n.state}
                  onChange={(e) => n.set(e.target.checked)}
                  className="w-4 h-4 text-[#128C7E] rounded border-gray-300 focus:ring-[#128C7E] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 5: BILLING & PLAN */}
      {activeTab === 'billing' && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Paket Langganan</CardTitle>
            <CardDescription>Status paket dan batasan penggunaan bisnis Anda.</CardDescription>
          </CardHeader>

          <div className="space-y-6">
            {/* Plan Summary Card */}
            <div className="p-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-gray-900">Paket Free (Uji Coba)</span>
                  <Badge variant="success" size="md">Aktif</Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Akses dasar fondasi ChatLaris untuk 1 akun WhatsApp.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                className="font-bold shrink-0"
                onClick={() =>
                  setComingSoon({
                    open: true,
                    title: 'Upgrade Paket Pro / Business',
                  })
                }
              >
                Upgrade Paket
              </Button>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Kuota Chat</span>
                <p className="text-base font-bold text-gray-900 mt-1">1,000 / bln</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Katalog Produk</span>
                <p className="text-base font-bold text-gray-[#128C7E] mt-1">Maks 50 Produk</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">WhatsApp Gateway</span>
                <p className="text-base font-bold text-gray-900 mt-1">1 Nomor WA</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Modal placeholder */}
      <ComingSoonModal
        isOpen={comingSoon.open}
        onClose={() => setComingSoon({ open: false, title: '' })}
        featureName={comingSoon.title}
        description="Fitur pembayaran dan upgrade paket akan diintegrasikan dengan payment gateway pada fase mendatang."
      />
    </div>
  )
}
