'use client'

import React from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  onConfirmDelete: () => void
  isDeleting?: boolean
}

export function DeleteModal({ isOpen, onClose, productName, onConfirmDelete, isDeleting }: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Produk Ini?">
      <div className="space-y-4 py-2">
        <p className="text-xs text-gray-600 leading-relaxed">
          Apakah Anda yakin ingin menghapus produk <strong className="text-gray-900">{productName}</strong>? Produk yang telah dihapus tidak dapat dipulihkan kembali.
        </p>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isDeleting}>
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={isDeleting}
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => {
              onConfirmDelete()
            }}
          >
            Hapus Produk
          </Button>
        </div>
      </div>
    </Modal>
  )
}
