'use client'

import React from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

interface DuplicateModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  onConfirmDuplicate: () => void
  isDuplicating?: boolean
}

export function DuplicateModal({ isOpen, onClose, productName, onConfirmDuplicate, isDuplicating }: DuplicateModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duplikat Produk">
      <div className="space-y-4 py-2">
        <p className="text-xs text-gray-600 leading-relaxed">
          Sistem akan membuat produk baru dengan status <strong className="text-gray-900">Draft</strong> bernamakan <strong className="text-gray-900">{productName} Copy</strong>.
        </p>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDuplicating}>
            Batal
          </Button>
          <Button
            variant="secondary"
            size="sm"
            isLoading={isDuplicating}
            icon={<Copy className="w-4 h-4" />}
            onClick={onConfirmDuplicate}
          >
            Duplikat Produk
          </Button>
        </div>
      </div>
    </Modal>
  )
}
