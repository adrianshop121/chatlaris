'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { ProductForm } from '@/components/products/product-form'
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
    if (typeof window !== 'undefined' && productId) {
      const savedProducts = localStorage.getItem('chatlaris_products')
      const savedImages = localStorage.getItem('chatlaris_product_images')
      const savedVariants = localStorage.getItem('chatlaris_product_variants')

      if (savedProducts) {
        try {
          const list: Product[] = JSON.parse(savedProducts)
          const target = list.find((p) => p.id === productId)
          if (target) setProduct(target)
        } catch (e) {
          console.warn('Error loading product:', e)
        }
      }

      if (savedImages) {
        try {
          const imagesMap = JSON.parse(savedImages)
          if (imagesMap[productId]) setProductImages(imagesMap[productId])
        } catch (e) {
          console.warn('Error loading images:', e)
        }
      }

      if (savedVariants) {
        try {
          const variantsMap = JSON.parse(savedVariants)
          if (variantsMap[productId]) setProductVariants(variantsMap[productId])
        } catch (e) {
          console.warn('Error loading variants:', e)
        }
      }

      setIsLoading(false)
    }
  }, [productId])

  const handleSaveProduct = async (data: {
    product: Partial<Product>
    images: { id?: string; storage_path: string; file_name: string; sort_order: number }[]
    variants: any[]
    tags: string[]
  }) => {
    if (typeof window !== 'undefined' && product) {
      const savedProducts = localStorage.getItem('chatlaris_products')
      const productsList: Product[] = savedProducts ? JSON.parse(savedProducts) : []

      const updatedProduct: Product = {
        ...product,
        ...data.product,
        updated_at: new Date().toISOString(),
      } as Product

      const updatedProducts = productsList.map((p) => (p.id === productId ? updatedProduct : p))
      localStorage.setItem('chatlaris_products', JSON.stringify(updatedProducts))

      // Update images
      const savedImages = localStorage.getItem('chatlaris_product_images')
      const imagesMap = savedImages ? JSON.parse(savedImages) : {}
      imagesMap[productId] = data.images.map((img, i) => ({
        id: img.id || 'img_' + Math.random().toString(36).substring(2, 9),
        product_id: productId,
        business_id: business?.id || 'default',
        storage_path: img.storage_path,
        file_name: img.file_name,
        sort_order: i,
        created_at: new Date().toISOString(),
      }))
      localStorage.setItem('chatlaris_product_images', JSON.stringify(imagesMap))

      // Update variants
      const savedVariants = localStorage.getItem('chatlaris_product_variants')
      const variantsMap = savedVariants ? JSON.parse(savedVariants) : {}
      variantsMap[productId] = data.variants
      localStorage.setItem('chatlaris_product_variants', JSON.stringify(variantsMap))

      await new Promise((r) => setTimeout(r, 600))
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
