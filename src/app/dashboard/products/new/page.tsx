'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { ProductForm } from '@/components/products/product-form'
import { createProductInDb } from '@/lib/supabase/products-db'
import { Product } from '@/types/database.types'

export default function NewProductPage() {
  const router = useRouter()
  const { business } = useAuth()

  const handleSaveProduct = async (data: {
    product: Partial<Product>
    images: { file?: File; storage_path: string; file_name: string; sort_order: number }[]
    variants: any[]
    tags: string[]
  }) => {
    const businessId = business?.id || 'default'
    await createProductInDb(businessId, data.product, data.images, data.variants, data.tags)
    router.push('/dashboard/products')
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <h1 className="text-xl font-black text-gray-900">Tambah Produk Baru</h1>
        <p className="text-xs text-gray-500 mt-1">
          Lengkapi detail informasi produk, foto, harga, dan stok untuk dimasukkan ke katalog.
        </p>
      </div>

      <ProductForm businessId={business?.id || 'default'} onSave={handleSaveProduct} />
    </div>
  )
}
