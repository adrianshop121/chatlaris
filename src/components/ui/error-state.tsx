import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from './button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Terjadi kesalahan',
  message = 'Data belum berhasil dimuat. Silakan coba lagi.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 rounded-xl border border-rose-100">
      <div className="p-3 bg-rose-100 text-rose-600 rounded-full mb-3">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-600 max-w-sm mt-1 mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  )
}
