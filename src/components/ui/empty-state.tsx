import React from 'react'
import { Inbox } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = 'Belum Ada Data',
  description = 'Data akan muncul di sini setelah Anda mulai menggunakan fitur ini.',
  icon = <Inbox className="w-10 h-10 text-gray-400" />,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-gray-100 shadow-2xs">
      <div className="p-3 bg-gray-50 rounded-full mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
