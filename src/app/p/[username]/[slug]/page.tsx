'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Product, ProductImage, ProductVariant, Business } from '@/types/database.types'
import { fetchProductBySlug } from '@/lib/supabase/products-db'
import {
  MessageSquare,
  Share2,
  Copy,
  Check,
  Package,
  Store,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react'

export default function PublicProductPage() {
  const params = useParams()
  const username = params.username as string
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [businessInfo, setBusinessInfo] = useState<Partial<Business>>({
    name: username.replace(/-/g, ' ').toUpperCase(),
    phone: '6281234567890',
  })

  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadPublicProduct() {
      if (slug) {
        let found = await fetchProductBySlug(slug)

        // Demo fallback if product matches demo slug
        if (!found && (slug === 'dress-floral-premium' || slug.includes('dress'))) {
          found = {
            id: 'prod_demo_1',
            business_id: 'default',
            name: 'Dress Floral Premium',
            slug: 'dress-floral-premium',
            description:
              'Dress floral cantik dengan bahan katun rayon premium adem, jahitan rapi, dan busui friendly. Cocok untuk acara santai maupun semi formal.',
            normal_price: 185000,
            discount_price: 150000,
            stock: 8,
            unit: 'pcs',
            category: 'Fashion',
            weight_grams: 500,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            images: [],
            variants: [
              { id: '1', product_id: 'prod_demo_1', business_id: 'default', name: 'Ukuran S / Merah', stock: 3, created_at: '', updated_at: '', sku: null, price_override: null },
              { id: '2', product_id: 'prod_demo_1', business_id: 'default', name: 'Ukuran M / Biru', stock: 5, created_at: '', updated_at: '', sku: null, price_override: null },
            ],
          }
        }

        if (found) {
          setProduct(found)
          setImages(found.images || [])
          setVariants(found.variants || [])
          if (found.variants && found.variants.length > 0) {
            setSelectedVariant(found.variants[0])
          }
        }

        if (typeof window !== 'undefined') {
          const savedBiz = localStorage.getItem('chatlaris_business')
          if (savedBiz) {
            try {
              setBusinessInfo(JSON.parse(savedBiz))
            } catch (e) {}
          }
        }

        setIsLoading(false)
      }
    }
    loadPublicProduct()
  }, [slug])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
        <div className="text-xs text-gray-500 font-bold flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#128C7E] animate-bounce" />
          <span>Memuat halaman produk...</span>
        </div>
      </div>
    )
  }

  if (!product || product.status === 'draft' || product.status === 'inactive') {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Produk Tidak Tersedia</h2>
        <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
          Halaman produk ini tidak ditemukan atau telah dinonaktifkan oleh pemilik toko.
        </p>
        <Link href="/" className="text-xs font-bold text-[#128C7E] hover:underline">
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const isDiscount = product.discount_price !== null && product.discount_price < product.normal_price
  const currentPrice = selectedVariant?.price_override ?? (isDiscount ? product.discount_price! : product.normal_price)
  const isOutOfStock = product.stock === 0 || product.status === 'out_of_stock'

  // Format WhatsApp Order Link
  const phone = businessInfo.phone || ''
  const waText = encodeURIComponent(
    `Halo kak, saya tertarik dengan *${product.name}* ${
      selectedVariant ? `(Varian: ${selectedVariant.name})` : ''
    }. Apakah masih tersedia?`
  )
  const waUrl = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${waText}` : '#'

  const handleShareProduct = async () => {
    const currentUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Cek produk ${product.name} di toko ${businessInfo.name}!`,
          url: currentUrl,
        })
        return
      } catch (e) {}
    }

    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch (e) {}
  }

  const currentImageSrc = images[selectedImageIdx]?.storage_path || null

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Store Header Banner */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-[#128C7E] rounded-full flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-gray-900">{businessInfo.name || 'Toko Resmi'}</h3>
                <ShieldCheck className="w-4 h-4 text-[#128C7E]" />
              </div>
              <p className="text-[11px] text-gray-500">Toko Online Resmi ChatLaris</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            onClick={handleShareProduct}
            className="text-xs"
          >
            {copiedLink ? 'Link Tersalin!' : 'Bagikan'}
          </Button>
        </div>

        {/* Main Product Display Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 p-6 border-b md:border-b-0 md:border-r border-gray-100 space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 flex items-center justify-center">
              {currentImageSrc ? (
                <img src={currentImageSrc} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-12 h-12 mb-2 opacity-40" />
                  <span className="text-xs font-medium">Foto Produk</span>
                </div>
              )}

              {isDiscount && (
                <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  DISKON
                </span>
              )}
            </div>

            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImageIdx === idx ? 'border-[#128C7E] ring-2 ring-[#128C7E]/20' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.storage_path} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details & WhatsApp Order CTA */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                {product.category && (
                  <Badge variant="success" size="sm" className="mb-2">
                    {product.category}
                  </Badge>
                )}
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
              </div>

              {/* Pricing Section */}
              <div className="space-y-1 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                <span className="text-xs text-gray-500 font-bold block">Harga Terkini:</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-[#128C7E]">
                    Rp{currentPrice.toLocaleString('id-ID')}
                  </span>
                  {isDiscount && (
                    <span className="text-sm text-gray-400 line-through font-semibold">
                      Rp{product.normal_price.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="text-xs">
                {isOutOfStock ? (
                  <span className="font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 inline-block">
                    ❌ Stok sedang habis
                  </span>
                ) : (
                  <span className="text-gray-700">
                    Stok Tersedia: <strong className="text-gray-900 font-bold">{product.stock}</strong> {product.unit}
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Pilih Varian:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(v)}
                        className={`text-xs px-3 py-2 rounded-xl border font-semibold transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-[#128C7E] bg-[#128C7E] text-white shadow-sm'
                            : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Description */}
              {product.description && (
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Deskripsi Produk:</h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {phone ? (
                <a
                  href={isOutOfStock ? '#' : waUrl}
                  target={isOutOfStock ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md ${
                    isOutOfStock
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                      : 'bg-[#25D366] text-white hover:bg-[#1faa53]'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 fill-current" />
                  <span>{isOutOfStock ? 'Stok sedang habis' : 'Pesan via WhatsApp'}</span>
                </a>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-center font-semibold">
                  Nomor WhatsApp bisnis belum diatur oleh penjual.
                </div>
              )}

              <p className="text-[10px] text-center text-gray-400">
                Pemesanan resmi langsung terhubung ke WhatsApp Penjual
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
