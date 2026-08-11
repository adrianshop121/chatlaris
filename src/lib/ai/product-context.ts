import { Product, ProductVariant, ProductTag } from '@/types/database.types'

export interface FullProductContext extends Product {
  variants?: ProductVariant[]
  tags?: ProductTag[]
}

export function buildProductCatalogContext(products: FullProductContext[]): string {
  if (!products || products.length === 0) {
    return '[KATALOG PRODUK SAYA]\nStatus: Katalog produk saat ini belum memiliki produk terdaftar.'
  }

  const activeProducts = products.filter((p) => p.status === 'active' || p.status === 'out_of_stock')

  if (activeProducts.length === 0) {
    return '[KATALOG PRODUK SAYA]\nStatus: Belum ada produk dengan status Aktif di katalog.'
  }

  let text = '[KATALOG PRODUK SAYA — INFORMASI REAL-TIME TOKO]\n'
  text += `Total Produk Aktif: ${activeProducts.length}\n\n`

  activeProducts.forEach((p, idx) => {
    const isDiscount = p.discount_price !== null && p.discount_price < p.normal_price
    const priceText = isDiscount
      ? `Rp${p.discount_price?.toLocaleString('id-ID')} (Harga Normal: Rp${p.normal_price.toLocaleString('id-ID')})`
      : `Rp${p.normal_price.toLocaleString('id-ID')}`

    const isOutOfStock = p.stock === 0 || p.status === 'out_of_stock'
    const statusText = isOutOfStock ? '❌ STOK HABIS' : `✅ Tersedia (${p.stock} ${p.unit})`

    text += `PRODUK ${idx + 1}: ${p.name}\n`
    text += `- Kategori: ${p.category || 'Umum'}\n`
    text += `- Harga Beli: ${priceText}\n`
    text += `- Status & Stok: ${statusText}\n`

    if (p.description) {
      text += `- Deskripsi: ${p.description.trim()}\n`
    }

    if (p.variants && p.variants.length > 0) {
      text += `- Pilihan Varian / Ukuran / Warna:\n`
      p.variants.forEach((v) => {
        const vPrice = v.price_override ? `Rp${v.price_override.toLocaleString('id-ID')}` : 'Sama dengan harga utama'
        const vStockText = v.stock === 0 ? 'Habis' : `${v.stock} unit`
        text += `  • ${v.name} (Stok: ${vStockText}, Harga: ${vPrice})\n`
      })
    }

    if (p.tags && p.tags.length > 0) {
      text += `- Tag: ${p.tags.map((t) => t.tag).join(', ')}\n`
    }

    text += `\n`
  })

  return text.trim()
}
