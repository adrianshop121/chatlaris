'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import {
  MessageSquare,
  Home,
  Inbox,
  Bot,
  ShoppingBag,
  Package,
  Users,
  Zap,
  Megaphone,
  BarChart3,
  Settings,
  Lock,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ComingSoonModal } from '@/components/ui/coming-soon-modal'

interface SidebarProps {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  isFunctional: boolean
  badge?: string
}

export function Sidebar({ mobileOpen = false, setMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const [comingSoonModal, setComingSoonModal] = useState<{ open: boolean; title: string }>({
    open: false,
    title: '',
  })

  const navGroups: { groupTitle: string; items: NavItem[] }[] = [
    {
      groupTitle: 'Utama',
      items: [
        { title: 'Beranda', href: '/dashboard', icon: <Home className="w-4 h-4" />, isFunctional: true },
        { title: 'Inbox', href: '/dashboard/inbox', icon: <Inbox className="w-4 h-4" />, isFunctional: false, badge: 'Segera hadir' },
        { title: 'AI Agent', href: '/dashboard/ai-agent', icon: <Bot className="w-4 h-4" />, isFunctional: true },
        { title: 'Produk', href: '/dashboard/products', icon: <ShoppingBag className="w-4 h-4" />, isFunctional: true },
        { title: 'Order', href: '/dashboard/orders', icon: <Package className="w-4 h-4" />, isFunctional: false, badge: 'Segera hadir' },
        { title: 'Pipeline', href: '/dashboard/crm', icon: <Users className="w-4 h-4" />, isFunctional: false, badge: 'Segera hadir' },
      ],
    },
    {
      groupTitle: 'Automasi',
      items: [
        { title: 'Flow Automation', href: '/dashboard/flows', icon: <Zap className="w-4 h-4" />, isFunctional: false, badge: 'Segera hadir' },
        { title: 'Broadcast', href: '/dashboard/broadcast', icon: <Megaphone className="w-4 h-4" />, isFunctional: false, badge: 'Segera hadir' },
      ],
    },
    {
      groupTitle: 'Analitik',
      items: [
        { title: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 className="w-4 h-4" />, isFunctional: false, badge: 'Segera hadir' },
      ],
    },
    {
      groupTitle: 'System',
      items: [
        { title: 'Settings', href: '/dashboard/settings', icon: <Settings className="w-4 h-4" />, isFunctional: true },
      ],
    },
  ]

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (!item.isFunctional) {
      e.preventDefault()
      setComingSoonModal({ open: true, title: item.title })
    } else {
      if (setMobileOpen) setMobileOpen(false)
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#128C7E] text-white w-64 select-none border-r border-[#0e7065]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#18a090] flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#25D366] rounded-xl text-white shadow-sm">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">ChatLaris</h1>
            <span className="text-[10px] font-semibold bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-full border border-[#25D366]/30">
              PROD READY
            </span>
          </div>
        </div>
        <p className="text-[11px] text-emerald-100/80 font-medium pt-1">
          AI yang jual, kamu yang terima ordernya.
        </p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-200/60 mb-2">
              {group.groupTitle}
            </h2>

            {group.items.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleItemClick(e, item)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                    isActive
                      ? 'bg-[#25D366] text-white shadow-md font-bold'
                      : item.isFunctional
                      ? 'text-emerald-50 hover:bg-[#18a090] hover:text-white'
                      : 'text-emerald-100/60 hover:bg-[#159385]/50 cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx(isActive ? 'text-white' : 'text-emerald-200 group-hover:text-white')}>
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </div>

                  {item.badge ? (
                    <span className="text-[10px] font-medium bg-[#0e7065] text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/20">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5" />
                  ) : null}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-[#18a090] bg-[#075E54] text-xs text-emerald-100/70 flex items-center justify-between">
        <span>ChatLaris v1.0 (Phase 1)</span>
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={comingSoonModal.open}
        onClose={() => setComingSoonModal({ open: false, title: '' })}
        featureName={comingSoonModal.title}
        description={`Fitur ${comingSoonModal.title} disiapkan untuk tahap pengembangan selanjutnya.`}
      />
    </>
  )
}
