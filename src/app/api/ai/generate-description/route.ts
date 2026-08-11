import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productName, category, features, targetCustomer, material, extraInfo } = body

    if (!productName || typeof productName !== 'string') {
      return NextResponse.json({ error: 'Nama produk harus diisi.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    // Fallback description generator when GEMINI_API_KEY is absent
    if (!apiKey) {
      const fallbackDesc = `Jelajahi keunggulan dari ${productName}! Ditujukan khusus untuk ${targetCustomer || 'Anda yang mencari produk berkualitas'}. Terbuat dari bahan ${material || 'pilihan terbaik'}, produk ini nyaman digunakan dan sangat direkomendasikan.

Keunggulan Utama:
• ${features || 'Kualitas premium & awet'}
• Desain modern & fungsional
• Cocok untuk pemakaian sehari-hari

Segera dapatkan ${productName} sekarang sebelum kehabisan stok! 🛍️`

      return NextResponse.json({ description: fallbackDesc })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Kamu adalah seorang Copywriter Penjualan Ecommerce profesional di Indonesia.
Tuliskan deskripsi produk yang menarik, ramah, persuasif, dan siap pakai untuk jualan di WhatsApp/Website.

Informasi Produk:
- Nama Produk: ${productName}
- Kategori: ${category || 'Umum'}
- Fitur / Keunggulan: ${features || 'Kualitas premium'}
- Target Pembeli: ${targetCustomer || 'Pelanggan Indonesia'}
- Bahan / Material: ${material || 'Bahan pilihan'}
- Informasi Tambahan: ${extraInfo || '-'}

Instruksi Penulisan:
1. Tulis dalam Bahasa Indonesia yang natural, menarik, dan persuasif.
2. Gunakan struktur 2-3 paragraf singkat dengan poin-poin keunggulan (bullet points).
3. Sertakan beberapa emoji yang relevan secara proporsional.
4. Sertakan kata ajakan beli (Call to Action) di akhir.
5. JANGAN menyertakan judul "Deskripsi Produk" atau teks meta pembuka. Langsung tuliskan teks deskripsinya.`

    const result = await model.generateContent(prompt)
    const descriptionText = result.response.text().trim()

    return NextResponse.json({ description: descriptionText })
  } catch (err: any) {
    console.error('AI Description Generation Error:', err)
    return NextResponse.json(
      { error: 'AI sedang mengalami kendala. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
