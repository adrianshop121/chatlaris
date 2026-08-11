import { Product, ProductVariant } from '@/types/database.types'

export interface FullProductContext extends Product {
  variants?: ProductVariant[]
}

export function buildProductCatalogContext(products: FullProductContext[]): string {
  if (!products || products.length === 0) {
    return 'Katalog Produk: Belum ada produk aktif yang terdaftar.'
  }

  const activeProducts = products.filter((p) => p.status === 'active' || p.status === 'out_of_stock')

  if (activeProducts.length === 0) {
    return 'Katalog Produk: Belum ada produk aktif yang tersedia.'
  }

  let text = '=== KATALOG PRODUK RESMI TOKO ===\n\n'

  activeProducts.forEach((p, idx) => {
    const isDiscount = p.discount_price !== null && p.discount_price < p.normal_price
    const priceText = isDiscount
      ? `Rp${p.discount_price?.toLocaleString('id-ID')} (Harga Normal: Rp${p.normal_price.toLocaleString('id-ID')})`
      : `Rp${p.normal_price.toLocaleString('id-ID')}`

    const statusText = p.stock === 0 || p.status === 'out_of_stock' ? '[STOK HABIS]' : `Stok: ${p.stock} ${p.unit}`

    text += `${idx + 1}. ${p.name}\n`
    text += `   - Category: ${p.category || 'Umum'}\n`
    text += `   - Harga: ${priceText}\n`
    text += `   - Status Stok: ${statusText}\n`
    if (p.description) {
      text += `   - Deskripsi Singkat: ${p.description.slice(0, 150)}...\n`
    }

    if (p.variants && p.variants.length > 0) {
      text += `   - Varian Tersedia:\n`
      p.variants.forEach((v) => {
        const vPrice = v.price_override ? `Rp${v.price_override.toLocaleString('id-ID')}` : 'Sama dengan harga utama'
        text += `     • ${v.name} (Stok: ${v.stock}) - ${vPrice}\n`
      })
    }

    text += `\n`
  })

  return text.trim()
}
