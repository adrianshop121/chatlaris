'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { ProductForm } from '@/components/products/product-form'
import { fetchBusinessProducts, updateProductInDb, FullProduct } from '@/lib/supabase/products-db'
import { Product, ProductImage, ProductVariant } from '@/types/database.types'
import { Loader2 } from 'lucide-react'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { business } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (productId) {
        const businessId = business?.id || 'default'
        const allProducts = await fetchBusinessProducts(businessId)
        const target = allProducts.find((p) => p.id === productId)

        if (target) {
          setProduct(target)
          setProductImages(target.images || [])
          setProductVariants(target.variants || [])
        }
        setIsLoading(false)
      }
    }
    loadData()
  }, [productId, business?.id])

  const handleSaveProduct = async (data: {
    product: Partial<Product>
    images: { id?: string; file?: File; storage_path: string; file_name: string; sort_order: number }[]
    variants: any[]
    tags: string[]
  }) => {
    if (product) {
      const businessId = business?.id || 'default'
      await updateProductInDb(productId, businessId, data.product, data.images, data.variants, data.tags)
      router.push('/dashboard/products')
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#128C7E]" />
        <span>Memuat data produk...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-16 text-center space-y-3">
        <h3 className="text-base font-bold text-gray-900">Produk Tidak Ditemukan</h3>
        <p className="text-xs text-gray-500">Produk yang Anda cari tidak ada atau telah dihapus.</p>
        <button
          type="button"
          onClick={() => router.push('/dashboard/products')}
          className="text-xs font-bold text-[#128C7E] hover:underline"
        >
          Kembali ke Katalog
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <h1 className="text-xl font-black text-gray-900">Edit Produk</h1>
        <p className="text-xs text-gray-500 mt-1">Perbarui informasi, foto, harga, atau stok untuk produk ini.</p>
      </div>

      <ProductForm
        initialProduct={product}
        initialImages={productImages}
        initialVariants={productVariants}
        businessId={business?.id || 'default'}
        onSave={handleSaveProduct}
      />
    </div>
  )
}
