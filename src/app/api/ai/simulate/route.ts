import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildAISystemPrompt } from '@/lib/ai/system-prompt-builder'
import { FullProductContext } from '@/lib/ai/product-context'

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { message, agent, businessName, knowledge, faqs, rules, operatingHours, settings, documents, products } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan pengguna tidak boleh kosong.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const lowerMsg = message.trim().toLowerCase()
    const activeProducts: FullProductContext[] = (products || []).filter(
      (p: any) => p.status === 'active' || p.status === 'out_of_stock'
    )

    // Build system prompt from context including live products
    const systemPrompt = buildAISystemPrompt({
      agent: agent || {
        id: 'default',
        business_id: 'default',
        name: 'Sari',
        personality: 'friendly',
        language: 'id',
        greeting: 'Halo kak! Ada yang bisa Sari bantu? 😊',
        status: 'draft',
        avatar_url: null,
        deployed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      businessName: businessName || 'Toko Kami',
      knowledge,
      faqs: faqs || [],
      rules: rules || [],
      operatingHours: operatingHours || [],
      settings,
      documents: documents || [],
      products: activeProducts,
    })

    // Check Operating Hours if 24h is false
    if (settings && !settings.active_24_hours) {
      const now = new Date()
      const currentDay = now.getDay()
      const hoursForToday = (operatingHours || []).find((h: any) => h.day_of_week === currentDay)

      if (hoursForToday && !hoursForToday.is_open) {
        const afterHoursMsg = settings.after_hours_message || 'Maaf kak, toko kami sedang tutup saat ini.'
        return NextResponse.json({
          response: afterHoursMsg,
          responseTimeMs: Date.now() - startTime,
          source: 'Jam Operasional (Tutup)',
          isEscalated: false,
        })
      }
    }

    // Call Gemini API if API Key exists
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const fullPrompt = `${systemPrompt}\n\nPembeli: "${message}"\n\nRespon Sales AI (Jawab singkat, relevan, dan natural untuk WhatsApp):`

        const result = await model.generateContent(fullPrompt)
        const text = result.response.text()

        const elapsed = Date.now() - startTime

        return NextResponse.json({
          response: text.trim(),
          responseTimeMs: elapsed,
          source: 'Gemini AI + Catalog Context',
          isEscalated: text.toLowerCase().includes('admin') || text.toLowerCase().includes('teruskan'),
        })
      } catch (geminiErr: any) {
        console.warn('Gemini API call warning (using fallback matcher):', geminiErr)
      }
    }

    // Smart Fallback Matcher (Catalog-Aware)
    let matchedAnswer: string | null = null

    // 1. Greeting Check
    if (lowerMsg === 'halo' || lowerMsg === 'hai' || lowerMsg === 'p' || lowerMsg === 'permisi' || lowerMsg === 'selamat pagi' || lowerMsg === 'selamat siang' || lowerMsg === 'selamat malam') {
      matchedAnswer = agent?.greeting || `Halo kak! Ada yang bisa ${agent?.name || 'Sari'} bantu hari ini? 😊`
    }

    // 2. Product Catalog Matcher (Live DB Products)
    if (!matchedAnswer && activeProducts.length > 0) {
      // Find matching product by name, category, or tags
      const matchedProduct = activeProducts.find((p) => {
        const pName = p.name.toLowerCase()
        const pCat = (p.category || '').toLowerCase()
        const words = lowerMsg.split(/\s+/)
        return (
          lowerMsg.includes(pName) ||
          pName.split(/\s+/).some((w) => w.length > 3 && lowerMsg.includes(w)) ||
          (pCat && lowerMsg.includes(pCat))
        )
      })

      if (matchedProduct) {
        const isDiscount = matchedProduct.discount_price !== null && matchedProduct.discount_price < matchedProduct.normal_price
        const price = isDiscount ? matchedProduct.discount_price! : matchedProduct.normal_price
        const formattedPrice = `Rp${price.toLocaleString('id-ID')}`
        const isOut = matchedProduct.stock === 0 || matchedProduct.status === 'out_of_stock'

        let variantText = ''
        if (matchedProduct.variants && matchedProduct.variants.length > 0) {
          variantText = `\n🎨 Pilihan Varian: ${matchedProduct.variants.map((v) => v.name).join(', ')}`
        }

        if (isOut) {
          matchedAnswer = `Untuk produk *${matchedProduct.name}* saat ini stoknya sedang habis kak ❌. Biar dikabari saat restok, kakak bisa tinggalkan pesan ya!`
        } else {
          matchedAnswer = `Ada kak! *${matchedProduct.name}* harganya ${formattedPrice} (Stok: ${matchedProduct.stock} ${matchedProduct.unit}).${variantText}\n\nMau dibantu proses ordernya kak? 🛍️`
        }
      } else if (
        lowerMsg.includes('ada produk') ||
        lowerMsg.includes('rekomendasi produk') ||
        lowerMsg.includes('katalog') ||
        lowerMsg.includes('jual apa')
      ) {
        const productNames = activeProducts.map((p) => `• ${p.name} (Rp${(p.discount_price || p.normal_price).toLocaleString('id-ID')})`).join('\n')
        matchedAnswer = `Berikut beberapa produk unggulan di toko kami kak 🛍️:\n\n${productNames}\n\nAda produk yang ingin kakak tanyakan? 😊`
      } else if (
        lowerMsg.includes('ada ') ||
        lowerMsg.includes('jual ') ||
        lowerMsg.includes('stok ') ||
        lowerMsg.includes('harga ')
      ) {
        // Query mentions specific item not in catalog
        const queryTerm = lowerMsg.replace(/(ada|jual|stok|harga|apa|kaos|baju|produk)\s+/g, '').trim()
        matchedAnswer = `Untuk produk ${queryTerm ? `"${queryTerm}"` : 'tersebut'} saat ini belum tersedia di katalog toko kami kak 🙏. Boleh saya bantu arahkan ke produk lain yang ada?`
      }
    } else if (!matchedAnswer && (lowerMsg.includes('produk') || lowerMsg.includes('katalog') || lowerMsg.includes('ada '))) {
      matchedAnswer = `Saat ini katalog produk toko belum memiliki produk aktif terdaftar. Boleh saya bantu tanyakan ke Admin ya kak 🙏`
    }

    // 3. FAQ Matcher
    if (!matchedAnswer && faqs && faqs.length > 0) {
      const activeFaqs = faqs.filter((f: any) => f.is_active)
      const matchedFaq = activeFaqs.find((f: any) =>
        lowerMsg.includes(f.question.toLowerCase().slice(0, 10)) ||
        f.question.toLowerCase().includes(lowerMsg)
      )
      if (matchedFaq) {
        matchedAnswer = `${matchedFaq.answer} 😊`
      }
    }

    // 4. Intent Matching on Knowledge Content
    if (!matchedAnswer && knowledge?.content) {
      const kContent = knowledge.content

      if (lowerMsg.includes('cara order') || lowerMsg.includes('bagaimana cara pesen') || lowerMsg.includes('bagaimana cara order') || lowerMsg.includes('cara beli')) {
        let orderSteps = 'Sebutkan nama produk, ukuran, warna, dan alamat pengiriman kakak.'
        const orderMatch = kContent.match(/Cara Order\s*:\s*([^\n]+)/i)
        if (orderMatch) {
          orderSteps = orderMatch[1].trim()
        }
        matchedAnswer = `Untuk order gampang banget kak 😊\n\nKakak tinggal kirim:\n• ${orderSteps.split('+').join('\n• ')}\n\nNanti kami bantu proses ordernya ya kak 🛍️`
      } else if (lowerMsg.includes('pengiriman') || lowerMsg.includes('ekspedisi') || lowerMsg.includes('kurir') || lowerMsg.includes('kirim pakai')) {
        let shippingInfo = 'JNE, J&T, SiCepat'
        const shipMatch = kContent.match(/Pengiriman\s*:\s*([^\n]+)/i)
        if (shipMatch) {
          shippingInfo = shipMatch[1].trim()
        }
        matchedAnswer = `Kami menyediakan pengiriman lewat ${shippingInfo} ya kak 😊`
      } else if (lowerMsg.includes('bayar') || lowerMsg.includes('transfer') || lowerMsg.includes('gopay') || lowerMsg.includes('bca') || lowerMsg.includes('pembayaran')) {
        let paymentInfo = 'BCA, GoPay'
        const payMatch = kContent.match(/Metode Bayar\s*:\s*([^\n]+)/i)
        if (payMatch) {
          paymentInfo = payMatch[1].trim()
        }

        if (lowerMsg.includes('ovo')) {
          if (paymentInfo.toLowerCase().includes('ovo')) {
            matchedAnswer = `Bisa kak 😊 Kami menerima pembayaran via OVO.`
          } else {
            matchedAnswer = `Untuk pembayaran via OVO belum tersedia di toko kami kak. Saat ini kami menyediakan pembayaran melalui ${paymentInfo}. Biar tidak salah info, boleh saya bantu teruskan ke admin ya 🙏`
          }
        } else if (lowerMsg.includes('gopay')) {
          matchedAnswer = `Bisa kak 😊 Kami menerima pembayaran melalui GoPay.`
        } else {
          matchedAnswer = `Untuk metode pembayaran, toko kami menerima ${paymentInfo} ya kak 😊`
        }
      }
    }

    // Default Fallback
    if (!matchedAnswer) {
      matchedAnswer = `Maaf kak, mengenai hal itu ${agent?.name || 'Sari'} belum bisa memastikan secara detail. Biar informasinya akurat, saya bantu teruskan pesan ini ke Admin toko ya kak! 🙏`
    }

    const elapsed = Date.now() - startTime

    return NextResponse.json({
      response: matchedAnswer,
      responseTimeMs: elapsed,
      source: apiKey ? 'Gemini AI + Catalog Context' : 'Katalog Produk (Lokal)',
      isEscalated: matchedAnswer.includes('Admin') || matchedAnswer.includes('teruskan'),
      notice: !apiKey ? 'Menggunakan simulator lokal (Tambahkan GEMINI_API_KEY di .env.local untuk respon penuh Gemini API)' : undefined,
    })
  } catch (err: any) {
    console.error('AI Simulation Route Error:', err)
    return NextResponse.json(
      { error: 'AI sedang mengalami kendala. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
