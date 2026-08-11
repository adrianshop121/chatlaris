import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 shadow-xs p-5 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div className={clsx('mb-4 pb-3 border-b border-gray-100 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return <h3 className={clsx('text-base font-semibold text-gray-900', className)}>{children}</h3>
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={clsx('text-xs text-gray-500 mt-0.5', className)}>{children}</p>
}
