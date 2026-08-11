'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { ProductForm } from '@/components/products/product-form'
import { Product } from '@/types/database.types'

export default function NewProductPage() {
  const router = useRouter()
  const { business } = useAuth()

  const handleSaveProduct = async (data: {
    product: Partial<Product>
    images: { storage_path: string; file_name: string; sort_order: number }[]
    variants: any[]
    tags: string[]
  }) => {
    if (typeof window !== 'undefined') {
      const savedProducts = localStorage.getItem('chatlaris_products')
      const productsList: Product[] = savedProducts ? JSON.parse(savedProducts) : []

      const newId = 'prod_' + Math.random().toString(36).substring(2, 9)

      const newProduct: Product = {
        id: newId,
        business_id: business?.id || 'default',
        name: data.product.name || 'Produk Baru',
        slug: data.product.slug || 'produk-baru',
        description: data.product.description || '',
        normal_price: data.product.normal_price || 0,
        discount_price: data.product.discount_price || null,
        stock: data.product.stock || 0,
        unit: data.product.unit || 'pcs',
        category: data.product.category || 'Fashion',
        weight_grams: data.product.weight_grams || 500,
        status: data.product.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const updatedProducts = [newProduct, ...productsList]
      localStorage.setItem('chatlaris_products', JSON.stringify(updatedProducts))

      // Save images metadata
      if (data.images.length > 0) {
        const savedImages = localStorage.getItem('chatlaris_product_images')
        const imagesMap = savedImages ? JSON.parse(savedImages) : {}
        imagesMap[newId] = data.images.map((img) => ({ ...img, id: 'img_' + Math.random().toString(36).substring(2, 9), product_id: newId, business_id: business?.id || 'default', created_at: new Date().toISOString() }))
        localStorage.setItem('chatlaris_product_images', JSON.stringify(imagesMap))
      }

      // Save variants metadata
      if (data.variants.length > 0) {
        const savedVariants = localStorage.getItem('chatlaris_product_variants')
        const variantsMap = savedVariants ? JSON.parse(savedVariants) : {}
        variantsMap[newId] = data.variants
        localStorage.setItem('chatlaris_product_variants', JSON.stringify(variantsMap))
      }

      // Delay to simulate smooth saving transition
      await new Promise((r) => setTimeout(r, 600))
      router.push('/dashboard/products')
    }
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
