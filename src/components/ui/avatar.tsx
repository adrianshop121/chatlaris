import React from 'react'
import { clsx } from 'clsx'

interface AvatarProps {
  name?: string
  src?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ name = '', src, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  const getInitials = (n: string) => {
    if (!n) return 'CL'
    const parts = n.trim().split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return n.slice(0, 2).toUpperCase()
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={clsx('rounded-full object-cover border border-gray-200 shrink-0', sizeClasses[size], className)}
      />
    )
  }

  return (
    <div
      className={clsx(
        'rounded-full bg-[#128C7E] text-white font-semibold flex items-center justify-center shrink-0 border border-[#0e7065]',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
