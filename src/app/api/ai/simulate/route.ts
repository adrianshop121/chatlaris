import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildAISystemPrompt } from '@/lib/ai/system-prompt-builder'

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await req.json()
    const { message, agent, businessName, knowledge, faqs, rules, operatingHours, settings, documents } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Pesan pengguna tidak boleh kosong.' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const lowerMsg = message.trim().toLowerCase()

    // Build system prompt from context
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
    })

    // Check Operating Hours if 24h is false
    if (settings && !settings.active_24_hours) {
      const now = new Date()
      const currentDay = now.getDay() // 0 = Sunday
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
          source: 'Gemini AI + Knowledge Base',
          isEscalated: text.toLowerCase().includes('admin') || text.toLowerCase().includes('teruskan'),
        })
      } catch (geminiErr: any) {
        console.warn('Gemini API call warning (using fallback matcher):', geminiErr)
      }
    }

    // Smart Fallback Matcher (Ensures natural responses without raw knowledge dumps)
    let matchedAnswer: string | null = null

    // 1. Greeting Check
    if (lowerMsg === 'halo' || lowerMsg === 'hai' || lowerMsg === 'p' || lowerMsg === 'permisi' || lowerMsg === 'selamat pagi' || lowerMsg === 'selamat siang' || lowerMsg === 'selamat malam') {
      matchedAnswer = agent?.greeting || `Halo kak! Ada yang bisa ${agent?.name || 'Sari'} bantu hari ini? 😊`
    }

    // 2. FAQ Matcher (Exact & Fuzzy)
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

    // 3. Smart Intent Matching on Knowledge Content
    if (!matchedAnswer && knowledge?.content) {
      const kContent = knowledge.content

      // Intent: Cara Order
      if (lowerMsg.includes('cara order') || lowerMsg.includes('bagaimana cara pesen') || lowerMsg.includes('bagaimana cara order') || lowerMsg.includes('cara beli')) {
        let orderSteps = 'Sebutkan nama produk, ukuran, warna, dan alamat pengiriman kakak.'
        const orderMatch = kContent.match(/Cara Order\s*:\s*([^\n]+)/i)
        if (orderMatch) {
          orderSteps = orderMatch[1].trim()
        }
        matchedAnswer = `Untuk order gampang banget kak 😊\n\nKakak tinggal kirim:\n• ${orderSteps.split('+').join('\n• ')}\n\nNanti kami bantu proses ordernya ya kak 🛍️`
      }

      // Intent: Pengiriman
      else if (lowerMsg.includes('pengiriman') || lowerMsg.includes('ekspedisi') || lowerMsg.includes('kurir') || lowerMsg.includes('kirim pakai')) {
        let shippingInfo = 'JNE, J&T, SiCepat'
        const shipMatch = kContent.match(/Pengiriman\s*:\s*([^\n]+)/i)
        if (shipMatch) {
          shippingInfo = shipMatch[1].trim()
        }
        matchedAnswer = `Kami menyediakan pengiriman lewat ${shippingInfo} ya kak 😊`
      }

      // Intent: Metode Bayar / GoPay / Transfer
      else if (lowerMsg.includes('bayar') || lowerMsg.includes('transfer') || lowerMsg.includes('gopay') || lowerMsg.includes('bca') || lowerMsg.includes('pembayaran')) {
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

      // Intent: Produk / Katalog
      else if (lowerMsg.includes('produk') || lowerMsg.includes('apa produknya') || lowerMsg.includes('katalog')) {
        matchedAnswer = `Untuk katalog produk lengkapnya saat ini belum tersedia di AI ya kak. Nanti setelah katalog produk terhubung, saya bisa bantu kasih informasi produk yang tersedia 😊`
      }

      // Intent: Minta seluruh info toko
      else if (lowerMsg.includes('kasih semua informasi') || lowerMsg.includes('semua data') || lowerMsg.includes('informasi toko')) {
        matchedAnswer = `Halo kak! ${businessName || 'Toko kami'} menyediakan berbagai produk berkualitas dengan pengiriman dan metode pembayaran yang fleksibel. Ada informasi spesifik yang ingin kakak tanyakan seperti cara order atau pengiriman? 😊`
      }
    }

    // Default Fallback (Honest unconfirmed + admin offer)
    if (!matchedAnswer) {
      matchedAnswer = `Maaf kak, mengenai hal itu ${agent?.name || 'Sari'} belum bisa memastikan secara detail. Biar informasinya akurat, saya bantu teruskan pesan ini ke Admin toko ya kak! 🙏`
    }

    const elapsed = Date.now() - startTime

    return NextResponse.json({
      response: matchedAnswer,
      responseTimeMs: elapsed,
      source: apiKey ? 'Knowledge Base Fallback' : 'Basis Pengetahuan (Lokal)',
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
