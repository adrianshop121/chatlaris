'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Product, ProductVariant } from '@/types/database.types'
import { Copy, Check, MessageSquare } from 'lucide-react'

interface WhatsAppMessageModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  variants?: ProductVariant[]
}

export function WhatsAppMessageModal({ isOpen, onClose, product, variants = [] }: WhatsAppMessageModalProps) {
  const [copied, setCopied] = useState(false)

  if (!product) return null

  const isDiscount = product.discount_price !== null && product.discount_price < product.normal_price
  const mainPrice = isDiscount ? product.discount_price! : product.normal_price
  const formattedMainPrice = `Rp${mainPrice.toLocaleString('id-ID')}`
  const formattedNormalPrice = `Rp${product.normal_price.toLocaleString('id-ID')}`

  let messageText = `━━━━━━━━━━━━━━━━\n🛍️ *${product.name.toUpperCase()}*\n━━━━━━━━━━━━━━━━\n\n`

  if (isDiscount) {
    messageText += `💰 *Harga:* ${formattedMainPrice}\n~~${formattedNormalPrice}~~\n\n`
  } else {
    messageText += `💰 *Harga:* ${formattedMainPrice}\n\n`
  }

  messageText += `📦 *Stok:* ${product.stock} ${product.unit}\n\n`

  if (product.description) {
    messageText += `✨ *Deskripsi:*\n${product.description.trim()}\n\n`
  }

  if (variants && variants.length > 0) {
    messageText += `🎨 *Pilihan Varian:*\n`
    variants.forEach((v) => {
      messageText += `• ${v.name} (Stok: ${v.stock})\n`
    })
    messageText += `\n`
  }

  messageText += `📱 *Cara Order:*\nKetik: Nama + Alamat + Pilihan produk/varian\n\nInfo lebih lanjut? Chat kami ya! 😊`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch (err) {
      console.warn('Clipboard copy failed fallback:', err)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Copy Pesan WhatsApp 📱">
      <div className="space-y-4 py-2">
        <p className="text-xs text-gray-600">
          Format pesan ini dapat langsung kamu tempel (paste) di chat WhatsApp calon pembeli.
        </p>

        {/* Formatted Message Preview Box */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-gray-800 whitespace-pre-line max-h-72 overflow-y-auto leading-relaxed shadow-inner">
          {messageText}
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          {copied ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Pesan berhasil disalin ✓
            </span>
          ) : (
            <span className="text-[11px] text-gray-400">Siap tempel di WhatsApp</span>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              onClick={handleCopy}
            >
              {copied ? 'Tersalin!' : 'Copy Pesan WA'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
