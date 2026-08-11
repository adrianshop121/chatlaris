import React from 'react'
import { clsx } from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'info', size = 'sm', className }: BadgeProps) {
  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-full border',
    md: 'text-xs px-2.5 py-1 font-medium rounded-full border',
  }

  return (
    <span className={clsx('inline-flex items-center gap-1 shrink-0', variantClasses[variant], sizeClasses[size], className)}>
      {children}
    </span>
  )
}
