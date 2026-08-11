'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Product, ProductImage, ProductVariant, ProductTag } from '@/types/database.types'
import {
  UploadCloud,
  Trash2,
  Plus,
  Sparkles,
  Loader2,
  Package,
  Check,
  AlertCircle,
  GripVertical,
  ArrowLeft,
  Save,
} from 'lucide-react'

interface ProductFormProps {
  initialProduct?: Product | null
  initialImages?: ProductImage[]
  initialVariants?: ProductVariant[]
  initialTags?: ProductTag[]
  businessId: string
  onSave: (data: {
    product: Partial<Product>
    images: { id?: string; storage_path: string; file_name: string; sort_order: number }[]
    variants: Partial<ProductVariant>[]
    tags: string[]
  }) => Promise<void>
}

export function ProductForm({
  initialProduct,
  initialImages = [],
  initialVariants = [],
  initialTags = [],
  businessId,
  onSave,
}: ProductFormProps) {
  const router = useRouter()

  // Form Fields State
  const [name, setName] = useState(initialProduct?.name || '')
  const [slug, setSlug] = useState(initialProduct?.slug || '')
  const [description, setDescription] = useState(initialProduct?.description || '')
  const [normalPrice, setNormalPrice] = useState<number | ''>(initialProduct?.normal_price ?? '')
  const [discountPrice, setDiscountPrice] = useState<number | ''>(initialProduct?.discount_price ?? '')
  const [stock, setStock] = useState<number | ''>(initialProduct?.stock ?? 0)
  const [unit, setUnit] = useState(initialProduct?.unit || 'pcs')
  const [customUnit, setCustomUnit] = useState('')
  const [category, setCategory] = useState(initialProduct?.category || 'Fashion')
  const [customCategory, setCustomCategory] = useState('')
  const [weightGrams, setWeightGrams] = useState<number | ''>(initialProduct?.weight_grams ?? 500)
  const [status, setStatus] = useState<'active' | 'draft' | 'inactive'>(
    initialProduct?.status && initialProduct.status !== 'out_of_stock' ? initialProduct.status : 'draft'
  )

  // Images State (Max 10)
  const [images, setImages] = useState<
    { id?: string; storage_path: string; file_name: string; sort_order: number; file?: File }[]
  >(
    initialImages.length > 0
      ? initialImages.map((img, i) => ({ ...img, sort_order: img.sort_order ?? i }))
      : []
  )

  // Tags State
  const [tags, setTags] = useState<string[]>(initialTags.map((t) => t.tag))
  const [tagInput, setTagInput] = useState('')

  // Variants State
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(initialVariants)

  // AI Description Helper Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiFeatures, setAiFeatures] = useState('')
  const [aiTarget, setAiTarget] = useState('')
  const [aiMaterial, setAiMaterial] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [aiGeneratedText, setAiGeneratedText] = useState('')

  // Form Submission & Error States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const defaultCategories = ['Fashion', 'Beauty', 'Makanan & Minuman', 'Elektronik', 'Aksesoris', 'Lainnya']
  const defaultUnits = ['pcs', 'kg', 'gram', 'meter', 'liter', 'box', 'paket', 'unit', 'Lainnya']

  // Auto slug generation from name
  const handleNameChange = (val: string) => {
    setName(val)
    if (!initialProduct) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      setSlug(generatedSlug)
    }
  }

  // Handle Photo Upload (Max 10)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    if (images.length + files.length > 10) {
      setFormError('Maksimal 10 foto per produk.')
      return
    }

    setFormError(null)

    const newImageItems = files.map((file, idx) => {
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file)
      return {
        storage_path: previewUrl,
        file_name: file.name,
        sort_order: images.length + idx,
        file,
      }
    })

    setImages((prev) => [...prev, ...newImageItems])
  }

  const handleDeleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index).map((img, i) => ({ ...img, sort_order: i })))
  }

  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(fromIdx, 1)
    updated.splice(toIdx, 0, moved)
    setImages(updated.map((img, i) => ({ ...img, sort_order: i })))
  }

  // Tags Helper
  const handleAddTag = () => {
    if (!tagInput.trim()) return
    const formattedTag = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`
    if (!tags.includes(formattedTag)) {
      setTags((prev) => [...prev, formattedTag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove))
  }

  // Variants Helper
  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: 'var_' + Math.random().toString(36).substring(2, 9),
        name: 'Ukuran M / Merah',
        sku: '',
        price_override: null,
        stock: 10,
      },
    ])
  }

  const handleUpdateVariant = (id: string, field: string, val: any) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: val } : v)))
  }

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id))
  }

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!name.trim()) {
      setFormError('Masukkan nama produk terlebih dahulu sebelum menulis dengan AI.')
      return
    }

    setIsGeneratingAi(true)
    setFormError(null)

    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: name,
          category: category === 'Lainnya' ? customCategory : category,
          features: aiFeatures,
          targetCustomer: aiTarget,
          material: aiMaterial,
        }),
      })

      const data = await res.json()
      setIsGeneratingAi(false)

      if (!res.ok) {
        setFormError(data.error || 'AI sedang mengalami kendala. Silakan coba lagi.')
        return
      }

      setAiGeneratedText(data.description)
    } catch (err: any) {
      setIsGeneratingAi(false)
      setFormError('Gagal menghubungkan ke AI. Silakan coba lagi.')
    }
  }

  const handleAcceptAiDescription = () => {
    setDescription(aiGeneratedText)
    setAiModalOpen(false)
    setAiGeneratedText('')
  }

  // Calculate Discount Percentage
  const numNormal = Number(normalPrice) || 0
  const numDiscount = Number(discountPrice) || 0
  const isDiscountValid = numDiscount > 0 && numDiscount < numNormal
  const discountPercent = isDiscountValid ? Math.round(((numNormal - numDiscount) / numNormal) * 100) : 0

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Nama produk wajib diisi.')
      return
    }

    if (numNormal <= 0) {
      setFormError('Harga normal produk harus lebih besar dari Rp0.')
      return
    }

    if (discountPrice !== '' && numDiscount >= numNormal) {
      setFormError('Harga diskon harus lebih kecil dari harga normal.')
      return
    }

    const finalUnit = unit === 'Lainnya' ? customUnit || 'pcs' : unit
    const finalCategory = category === 'Lainnya' ? customCategory || 'Lainnya' : category

    setIsSubmitting(true)

    try {
      await onSave({
        product: {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          normal_price: numNormal,
          discount_price: numDiscount > 0 ? numDiscount : null,
          stock: Number(stock) || 0,
          unit: finalUnit,
          category: finalCategory,
          weight_grams: Number(weightGrams) || 0,
          status: Number(stock) === 0 ? 'out_of_stock' : status,
        },
        images,
        variants,
        tags,
      })

      setIsSubmitting(false)
    } catch (err: any) {
      setIsSubmitting(false)
      setFormError(err.message || 'Terjadi kendala saat menyimpan produk.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-12">
      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* SECTION A: FOTO PRODUK */}
      <Card>
        <CardHeader>
          <CardTitle>Foto Produk (Maks 10 Foto)</CardTitle>
          <CardDescription>
            Upload foto produk terbaik kamu. Foto pertama akan dijadikan Foto Utama katalog.
          </CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group flex items-center justify-center"
              >
                <img src={img.storage_path} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

                {idx === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#128C7E] text-white text-[10px] font-bold rounded-full shadow-xs">
                    Utama
                  </span>
                )}

                {/* Move & Delete Controls */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx - 1)}
                      className="p-1 bg-white text-gray-800 rounded hover:bg-gray-100 text-xs font-bold"
                      title="Geser ke kiri"
                    >
                      ←
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, idx + 1)}
                      className="p-1 bg-white text-gray-800 rounded hover:bg-gray-100 text-xs font-bold"
                      title="Geser ke kanan"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="p-1.5 bg-rose-600 text-white rounded hover:bg-rose-700"
                    title="Hapus foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {images.length < 10 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 hover:border-[#128C7E] rounded-xl flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-emerald-50/40 transition-colors cursor-pointer text-center">
                <UploadCloud className="w-6 h-6 text-[#128C7E] mb-1" />
                <span className="text-[11px] font-bold text-gray-700">Tambah Foto</span>
                <span className="text-[9px] text-gray-400 mt-0.5">({images.length}/10)</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION B: INFORMASI PRODUK */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
          <CardDescription>Nama dan deskripsi detail produk kamu.</CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <Input
            label="Nama Produk *"
            placeholder="Contoh: Dress Floral Premium"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Deskripsi Produk
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs text-[#128C7E] border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100 font-bold"
                icon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => setAiModalOpen(true)}
              >
                ✨ Tulis dengan AI
              </Button>
            </div>
            <textarea
              className="w-full text-sm rounded-lg border border-gray-300 p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E] leading-relaxed"
              rows={5}
              placeholder="Jelaskan produk, manfaat, bahan, keunggulan, dan informasi penting lainnya..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* SECTION C: HARGA & DISKON */}
      <Card>
        <CardHeader>
          <CardTitle>Harga & Diskon</CardTitle>
          <CardDescription>Atur harga normal dan harga diskon produk.</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Harga Normal (Rp) *"
            type="number"
            placeholder="185000"
            value={normalPrice}
            onChange={(e) => setNormalPrice(e.target.value === '' ? '' : Number(e.target.value))}
            required
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Harga Diskon (Opsional)
              </label>
              {isDiscountValid && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Hemat {discountPercent}%!
                </span>
              )}
            </div>
            <Input
              type="number"
              placeholder="150000"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
        </div>
      </Card>

      {/* SECTION D: STOK & SATUAN */}
      <Card>
        <CardHeader>
          <CardTitle>Stok & Satuan</CardTitle>
          <CardDescription>Kelola jumlah stok dan satuan unit penjualan.</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Jumlah Stok *"
            type="number"
            placeholder="10"
            value={stock}
            onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Satuan Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
            >
              {defaultUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            {unit === 'Lainnya' && (
              <Input
                placeholder="Masukkan satuan (misal: pasang)"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </Card>

      {/* SECTION E: KATEGORI & TAG */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori & Tag</CardTitle>
          <CardDescription>Kategori dan tag membantu pembeli dan AI mengenali produk.</CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Kategori Produk
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
            >
              {defaultCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {category === 'Lainnya' && (
              <Input
                placeholder="Masukkan nama kategori custom"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Tag Produk (Contoh: #best-seller, #promo)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Tambah tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                Tambah
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 text-[#128C7E] border border-emerald-200 rounded-full font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION F: VARIAN PRODUK */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Varian Produk (Opsional)</CardTitle>
            <CardDescription>Tambah varian ukuran, warna, atau tipe produk.</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddVariant}
          >
            Tambah Varian
          </Button>
        </CardHeader>

        {variants.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4 italic">
            Produk ini tidak memiliki varian khusus (menggunakan stok utama).
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((v) => (
              <div
                key={v.id}
                className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-xs"
              >
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    placeholder="Nama Varian (misal: L / Merah)"
                    value={v.name || ''}
                    onChange={(e) => handleUpdateVariant(v.id!, 'name', e.target.value)}
                    className="w-full text-xs font-bold rounded border border-gray-300 p-2 text-gray-900"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="SKU (opsional)"
                    value={v.sku || ''}
                    onChange={(e) => handleUpdateVariant(v.id!, 'sku', e.target.value)}
                    className="w-full text-xs rounded border border-gray-300 p-2 text-gray-900"
                  />
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Stok Varian"
                    value={v.stock ?? 0}
                    onChange={(e) => handleUpdateVariant(v.id!, 'stock', Number(e.target.value))}
                    className="w-full text-xs rounded border border-gray-300 p-2 text-gray-900"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <input
                    type="number"
                    placeholder="Harga Override"
                    value={v.price_override ?? ''}
                    onChange={(e) =>
                      handleUpdateVariant(
                        v.id!,
                        'price_override',
                        e.target.value === '' ? null : Number(e.target.value)
                      )
                    }
                    className="w-full text-xs rounded border border-gray-300 p-2 text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id!)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* SECTION G: PENGIRIMAN & STATUS */}
      <Card>
        <CardHeader>
          <CardTitle>Pengiriman & Status</CardTitle>
          <CardDescription>Berat produk untuk estimasi ongkir & status keaktifan produk.</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Berat Produk (Gram)"
            type="number"
            placeholder="500"
            value={weightGrams}
            onChange={(e) => setWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status Produk
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-sm rounded-lg border border-gray-300 p-2.5 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
            >
              <option value="active">Aktif (Tampil di Katalog)</option>
              <option value="draft">Draft (Disimpan Sementara)</option>
              <option value="inactive">Nonaktif (Disembunyikan)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Form Bottom Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          size="md"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.push('/dashboard/products')}
        >
          Batal
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          icon={<Save className="w-4 h-4" />}
        >
          Simpan Produk
        </Button>
      </div>

      {/* AI Description Helper Modal */}
      <Modal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        title="✨ Tulis Deskripsi dengan AI"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-gray-600">
            AI Gemini akan membuatkan deskripsi produk yang menarik dan ramah untuk jualan.
          </p>

          <Input
            label="Fitur / Keunggulan Utama"
            placeholder="Contoh: Bahan adem, jahitan rapi, motif floral"
            value={aiFeatures}
            onChange={(e) => setAiFeatures(e.target.value)}
          />

          <Input
            label="Target Pembeli"
            placeholder="Contoh: Wanita 18-35 tahun"
            value={aiTarget}
            onChange={(e) => setAiTarget(e.target.value)}
          />

          <Input
            label="Bahan / Material"
            placeholder="Contoh: Katun Rayon Premium"
            value={aiMaterial}
            onChange={(e) => setAiMaterial(e.target.value)}
          />

          <Button
            type="button"
            variant="secondary"
            className="w-full font-bold"
            isLoading={isGeneratingAi}
            icon={<Sparkles className="w-4 h-4" />}
            onClick={handleGenerateAiDescription}
          >
            {isGeneratingAi ? 'AI Sedang Menulis...' : 'Generate Deskripsi'}
          </Button>

          {aiGeneratedText && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-800">Hasil Deskripsi AI:</label>
              <textarea
                className="w-full text-xs font-sans rounded-xl border border-emerald-300 p-3 bg-emerald-50/50 text-gray-900 leading-relaxed"
                rows={6}
                value={aiGeneratedText}
                onChange={(e) => setAiGeneratedText(e.target.value)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setAiModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Check className="w-4 h-4" />}
                  onClick={handleAcceptAiDescription}
                >
                  Gunakan Deskripsi Ini
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </form>
  )
}
