'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/supabase/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ProductCard } from '@/components/products/product-card'
import { WhatsAppMessageModal } from '@/components/products/whatsapp-message-modal'
import { DeleteModal } from '@/components/products/delete-modal'
import { DuplicateModal } from '@/components/products/duplicate-modal'
import { fetchBusinessProducts, deleteProductInDb, createProductInDb, FullProduct } from '@/lib/supabase/products-db'
import { Product, ProductImage, ProductVariant } from '@/types/database.types'
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Package,
  Sparkles,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()
  const { business, subscription } = useAuth()

  const [products, setProducts] = useState<FullProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Sorting State
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  // Modals State
  const [waModalProduct, setWaModalProduct] = useState<Product | null>(null)
  const [deleteTargetProduct, setDeleteTargetProduct] = useState<Product | null>(null)
  const [duplicateTargetProduct, setDuplicateTargetProduct] = useState<FullProduct | null>(null)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  // Load Products from Supabase DB / Storage Helper
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      const businessId = business?.id || 'default'
      const list = await fetchBusinessProducts(businessId)

      // Seed default demo product if list is completely empty
      if (list.length === 0) {
        const demoProduct: Partial<Product> = {
          name: 'Dress Floral Premium',
          slug: 'dress-floral-premium',
          description: 'Dress floral cantik dengan bahan katun rayon premium adem, jahitan rapi, dan busui friendly.',
          normal_price: 185000,
          discount_price: 150000,
          stock: 8,
          unit: 'pcs',
          category: 'Fashion',
          weight_grams: 500,
          status: 'active',
        }
        const createdDemo = await createProductInDb(
          businessId,
          demoProduct,
          [],
          [
            { name: 'Ukuran S / Merah', stock: 3 },
            { name: 'Ukuran M / Biru', stock: 5 },
          ],
          ['#best-seller', '#promo']
        )
        setProducts([createdDemo])
      } else {
        setProducts(list)
      }
      setIsLoading(false)
    }

    loadProducts()
  }, [business?.id])

  const userPlan = subscription?.plan || 'free'
  const isFreePlan = userPlan === 'free'
  const isProductLimitReached = isFreePlan && products.length >= 20

  const handleAddProductClick = () => {
    if (isProductLimitReached) {
      setUpgradeModalOpen(true)
    } else {
      router.push('/dashboard/products/new')
    }
  }

  // Handle Product Deletion
  const handleConfirmDelete = async () => {
    if (!deleteTargetProduct) return
    const businessId = business?.id || 'default'
    await deleteProductInDb(deleteTargetProduct.id, businessId)
    setProducts((prev) => prev.filter((p) => p.id !== deleteTargetProduct.id))
    setDeleteTargetProduct(null)
  }

  // Handle Product Duplication
  const handleConfirmDuplicate = async () => {
    if (!duplicateTargetProduct) return
    const businessId = business?.id || 'default'

    const newSlug = `${duplicateTargetProduct.slug}-copy-${Math.floor(Math.random() * 1000)}`
    const rawImages = (duplicateTargetProduct.images || []).map((img, i) => ({
      storage_path: img.storage_path,
      file_name: img.file_name,
      sort_order: i,
    }))

    const duplicated = await createProductInDb(
      businessId,
      {
        ...duplicateTargetProduct,
        name: `${duplicateTargetProduct.name} Copy`,
        slug: newSlug,
        status: 'draft',
      },
      rawImages,
      duplicateTargetProduct.variants || [],
      (duplicateTargetProduct.tags || []).map((t) => t.tag)
    )

    setProducts((prev) => [duplicated, ...prev])
    setDuplicateTargetProduct(null)
  }

  // Handle Toggle Product Status
  const handleToggleStatus = async (prod: Product) => {
    const businessId = business?.id || 'default'
    const nextStatus: 'active' | 'inactive' = prod.status === 'active' ? 'inactive' : 'active'
    const targetFull = products.find((p) => p.id === prod.id)
    if (!targetFull) return

    const rawImages = (targetFull.images || []).map((img, i) => ({
      id: img.id,
      storage_path: img.storage_path,
      file_name: img.file_name,
      sort_order: i,
    }))

    const updated = products.map((p) => (p.id === prod.id ? { ...p, status: nextStatus } : p))
    setProducts(updated)

    if (typeof window !== 'undefined') {
      localStorage.setItem(`chatlaris_products_${businessId}`, JSON.stringify(updated))
      localStorage.setItem('chatlaris_products', JSON.stringify(updated))
    }
  }

  // Categories list for filter
  const categoriesList = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[]

  // Filter & Search & Sort Logic
  const filteredProducts = products
    .filter((p) => {
      // Search logic
      const searchLower = search.toLowerCase().trim()
      if (searchLower) {
        const matchesName = p.name.toLowerCase().includes(searchLower)
        const matchesCategory = p.category?.toLowerCase().includes(searchLower)
        const matchesSlug = p.slug.toLowerCase().includes(searchLower)
        if (!matchesName && !matchesCategory && !matchesSlug) return false
      }

      // Status Filter logic
      if (statusFilter === 'active' && p.status !== 'active') return false
      if (statusFilter === 'draft' && p.status !== 'draft') return false
      if (statusFilter === 'inactive' && p.status !== 'inactive') return false
      if (statusFilter === 'out_of_stock' && p.stock > 0 && p.status !== 'out_of_stock') return false

      // Category Filter logic
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name)
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name)
      if (sortBy === 'price-low') return (a.discount_price ?? a.normal_price) - (b.discount_price ?? b.normal_price)
      if (sortBy === 'price-high') return (b.discount_price ?? b.normal_price) - (a.discount_price ?? a.normal_price)
      if (sortBy === 'stock-low') return a.stock - b.stock
      return 0
    })

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Produk</h1>
            <Badge variant="success" size="md">
              {products.length} Produk
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Kelola katalog produk dan informasi yang digunakan AI untuk membantu jualan.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleAddProductClick}
        >
          + Tambah Produk
        </Button>
      </div>

      {/* Free Plan Catalog Capacity Warning Banner */}
      {isFreePlan && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Paket Free: Kapasitas Katalog <strong className="text-gray-900">{products.length}/20 produk</strong>.
            </span>
          </div>
          {isProductLimitReached && (
            <Button variant="primary" size="sm" onClick={() => setUpgradeModalOpen(true)}>
              Upgrade Paket
            </Button>
          )}
        </div>
      )}

      {/* Controls Bar: Search, Status Tabs, Category Filter & Sorting */}
      <div className="space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
          {[
            { id: 'all', label: `Semua (${products.length})` },
            { id: 'active', label: `Aktif (${products.filter((p) => p.status === 'active' && p.stock > 0).length})` },
            { id: 'out_of_stock', label: `Habis (${products.filter((p) => p.stock === 0 || p.status === 'out_of_stock').length})` },
            { id: 'draft', label: `Draft (${products.filter((p) => p.status === 'draft').length})` },
            { id: 'inactive', label: `Nonaktif (${products.filter((p) => p.status === 'inactive').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'border-[#128C7E] text-[#128C7E] bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search, Category & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search produk, SKU, kategori, atau tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
            >
              <option value="all">Semua Kategori</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="name-asc">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="price-low">Harga Terendah</option>
              <option value="price-high">Harga Tertinggi</option>
              <option value="stock-low">Stok Terendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid / Skeleton / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-[#128C7E] rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">Belum Ada Produk</h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Tambahkan produk pertama kamu agar katalog dan AI bisa mengenal produk yang kamu jual.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddProductClick}
          >
            + Tambah Produk
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((prod) => {
            const productImgs = prod.images || []
            const mainImg = productImgs.find((i) => i.sort_order === 0) || productImgs[0] || null

            return (
              <ProductCard
                key={prod.id}
                product={prod}
                mainImage={mainImg}
                businessSlug={business?.slug || 'toko'}
                onEdit={(p) => router.push(`/dashboard/products/${p.id}/edit`)}
                onDuplicate={(p) => setDuplicateTargetProduct(p)}
                onCopyWA={(p) => setWaModalProduct(p)}
                onToggleStatus={handleToggleStatus}
                onDelete={(p) => setDeleteTargetProduct(p)}
              />
            )
          })}
        </div>
      )}

      {/* Modals */}
      <WhatsAppMessageModal
        isOpen={!!waModalProduct}
        onClose={() => setWaModalProduct(null)}
        product={waModalProduct}
        variants={
          waModalProduct
            ? (products.find((p) => p.id === waModalProduct.id)?.variants as ProductVariant[]) || []
            : []
        }
      />

      <DeleteModal
        isOpen={!!deleteTargetProduct}
        onClose={() => setDeleteTargetProduct(null)}
        productName={deleteTargetProduct?.name || ''}
        onConfirmDelete={handleConfirmDelete}
      />

      <DuplicateModal
        isOpen={!!duplicateTargetProduct}
        onClose={() => setDuplicateTargetProduct(null)}
        productName={duplicateTargetProduct?.name || ''}
        onConfirmDuplicate={handleConfirmDuplicate}
      />

      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Kapasitas Katalog Tercapai 🚀"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-gray-900">Limit Katalog Free Tercapai</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Paket Free Anda telah mencapai batas maksimal 20 produk. Upgrade ke Paket Pro untuk menambahkan katalog produk tanpa batas.
            </p>
          </div>
          <Button variant="primary" className="w-full font-bold" onClick={() => setUpgradeModalOpen(false)}>
            Tutup
          </Button>
        </div>
      </Modal>
    </div>
  )
}
