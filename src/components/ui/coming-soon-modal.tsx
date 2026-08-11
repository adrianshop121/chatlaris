'use client'

import React from 'react'
import { Modal } from './modal'
import { Button } from './button'
import { Sparkles } from 'lucide-react'

interface ComingSoonModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
  description?: string
}

export function ComingSoonModal({
  isOpen,
  onClose,
  featureName = 'Fitur',
  description = 'Fitur ini sedang dalam tahap pengembangan dan akan segera hadir pada update berikutnya!',
}: ComingSoonModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fitur Segera Hadir 🚀">
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-[#128C7E] rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-7 h-7 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-gray-900">{featureName}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
        <div className="pt-2">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Mengerti
          </Button>
        </div>
      </div>
    </Modal>
  )
}
