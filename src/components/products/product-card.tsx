'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Product, ProductImage } from '@/types/database.types'
import {
  Edit2,
  Copy,
  MessageSquare,
  ExternalLink,
  Trash2,
  MoreVertical,
  AlertTriangle,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

interface ProductCardProps {
  product: Product
  mainImage?: ProductImage | null
  businessSlug: string
  onEdit: (product: Product) => void
  onDuplicate: (product: Product) => void
  onCopyWA: (product: Product) => void
  onToggleStatus: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({
  product,
  mainImage,
  businessSlug,
  onEdit,
  onDuplicate,
  onCopyWA,
  onToggleStatus,
  onDelete,
}: ProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isDiscount = product.discount_price !== null && product.discount_price < product.normal_price
  const discountPercent = isDiscount
    ? Math.round(((product.normal_price - product.discount_price!) / product.normal_price) * 100)
    : 0

  const isLowStock = product.stock > 0 && product.stock < 5
  const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock'

  const getStatusBadge = () => {
    if (isOutOfStock) {
      return <Badge variant="gray">Habis</Badge>
    }
    switch (product.status) {
      case 'active':
        return <Badge variant="success">Aktif</Badge>
      case 'draft':
        return <Badge variant="gray">Draft</Badge>
      case 'inactive':
        return <Badge variant="error">Nonaktif</Badge>
      default:
        return <Badge variant="gray">Draft</Badge>
    }
  }

  const publicUrl = `/p/${businessSlug || 'toko'}/${product.slug}`

  return (
    <Card className="flex flex-col justify-between p-0 overflow-hidden hover:shadow-md transition-all border border-gray-200 group">
      {/* Image Thumbnail Container */}
      <div className="relative aspect-4/3 bg-gray-100 border-b border-gray-100 overflow-hidden">
        {mainImage?.storage_path ? (
          <img
            src={mainImage.storage_path}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Package className="w-10 h-10 mb-1 opacity-50" />
            <span className="text-[10px]">Belum ada foto</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {getStatusBadge()}
          {isLowStock && (
            <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-full flex items-center gap-1 shadow-xs">
              <AlertTriangle className="w-3 h-3" /> Stok Menipis
            </span>
          )}
          {isDiscount && (
            <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full shadow-xs">
              Diskon {discountPercent}%
            </span>
          )}
        </div>

        {/* Action Menu Dropdown Trigger */}
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg shadow-sm backdrop-blur-xs transition-colors"
            title="Menu Aksi"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-20 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(product)
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                  <span>Edit Produk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDuplicate(product)
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                  <span>Duplikat Produk</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onCopyWA(product)
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copy Pesan WA</span>
                </button>

                <Link
                  href={publicUrl}
                  target="_blank"
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>Lihat Produk</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onToggleStatus(product)
                  }}
                  className="w-full px-3 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 font-medium border-t border-gray-100"
                >
                  {product.status === 'active' ? (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Nonaktifkan</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Aktifkan</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(product)
                  }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Hapus Produk</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {product.category && (
            <span className="text-[10px] font-bold text-[#128C7E] uppercase tracking-wider block mb-1">
              {product.category}
            </span>
          )}
          <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">{product.name}</h3>
        </div>

        <div className="space-y-2">
          {/* Price */}
          <div>
            {isDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-rose-600">
                  Rp{product.discount_price?.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  Rp{product.normal_price.toLocaleString('id-ID')}
                </span>
              </div>
            ) : (
              <span className="text-base font-black text-gray-900">
                Rp{product.normal_price.toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {/* Stock & Quick Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
            <span>
              Stok: <strong className={isOutOfStock ? 'text-rose-600' : 'text-gray-900'}>{product.stock}</strong>{' '}
              {product.unit}
            </span>

            <Button
              variant="outline"
              size="sm"
              icon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={() => onCopyWA(product)}
              className="text-[11px] h-7 px-2.5"
            >
              Pesan WA
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
