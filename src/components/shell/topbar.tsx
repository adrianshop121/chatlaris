'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Menu, Bell, Building2, User, Settings, LogOut, ChevronDown } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const { user, profile, business, membership, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getPageTitle = () => {
    if (pathname.includes('/settings')) return 'Pengaturan'
    if (pathname.includes('/ai-agent')) return 'Latih AI Kamu'
    if (pathname.includes('/products')) return 'Produk'
    if (pathname.includes('/dashboard')) return 'Beranda'
    return 'Dashboard'
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-2xs h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left: Mobile Menu Button & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:hidden transition-colors cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold text-gray-900">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Right: Business Switcher, Notifications, User Menu */}
      <div className="flex items-center gap-3" ref={dropdownRef}>
        {/* Business Badge */}
        {business && (
          <div className="hidden sm:flex items-center gap-2 bg-[#F0F2F5] px-3 py-1.5 rounded-full border border-gray-200">
            <Building2 className="w-4 h-4 text-[#128C7E]" />
            <span className="text-xs font-bold text-gray-800 max-w-[140px] truncate">
              {business.name}
            </span>
            <Badge variant="success" size="sm">
              Free Plan
            </Badge>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#25D366] rounded-full ring-2 ring-white" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-xs space-y-2 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between font-semibold border-b border-gray-100 pb-2 text-gray-900">
                <span>Notifikasi</span>
                <span className="text-[10px] text-[#128C7E]">Semua Dibaca</span>
              </div>
              <div className="py-3 text-center text-gray-500">
                Belum ada notifikasi baru 🎉
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Avatar name={profile?.full_name || user?.email || 'User'} size="md" />
            <span className="hidden md:inline-block text-xs font-semibold text-gray-800 max-w-[100px] truncate">
              {profile?.full_name || user?.email?.split('@')[0]}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 animate-in fade-in zoom-in-95 space-y-2">
              {/* Profile Card Header */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <Avatar name={profile?.full_name || user?.email || 'User'} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {profile?.full_name || 'Pemilik Bisnis'}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="success" size="sm">
                        {membership?.role || 'owner'}
                      </Badge>
                      {business && (
                        <span className="text-[10px] text-gray-500 truncate">
                          ({business.name})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="space-y-1 pt-1">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Profil & Akun</span>
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>Pengaturan Bisnis</span>
                </Link>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
