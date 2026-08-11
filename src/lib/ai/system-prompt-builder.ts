import { AIAgent, AIBusinessKnowledge, AIFAQ, AIRule, AIOperatingHours, AISettings, AIKnowledgeDocument } from '@/types/database.types'
import { buildProductCatalogContext, FullProductContext } from '@/lib/ai/product-context'

interface BuildPromptParams {
  agent: AIAgent
  businessName: string
  knowledge?: AIBusinessKnowledge | null
  faqs?: AIFAQ[]
  rules?: AIRule[]
  operatingHours?: AIOperatingHours[]
  settings?: AISettings | null
  documents?: AIKnowledgeDocument[]
  products?: FullProductContext[]
}

export function buildAISystemPrompt({
  agent,
  businessName,
  knowledge,
  faqs = [],
  rules = [],
  operatingHours = [],
  settings,
  documents = [],
  products = [],
}: BuildPromptParams): string {
  const personalityGuides = {
    friendly: 'Gunakan bahasa yang ramah, hangat, dan santai namun tetap sopan. Boleh menggunakan emoji yang relevan. Sapa pembeli seperti teman terpercaya.',
    professional: 'Gunakan bahasa Indonesia yang baku, sopan, jelas, dan profesional. Hindari penggunaan emoji secara berlebihan.',
    playful: 'Gunakan bahasa yang santai, fun, energik, dan gaul khas anak muda. Gunakan variasi emoji yang menyenangkan.',
  }

  const languageGuides = {
    id: 'Selalu jawab menggunakan Bahasa Indonesia yang natural dan mudah dipahami.',
    en: 'Always respond in natural English.',
    mixed: 'Gunakan Bahasa Indonesia kasual yang dicampur dengan istilah Inggris populer (Bahasa Gaul/Bahasa Jaksel) secara natural.',
  }

  const activeFaqs = faqs.filter((f) => f.is_active)
  const activeRules = rules.filter((r) => r.is_active)
  const learnedDocs = documents.filter((d) => d.status === 'learned' && d.extracted_text)

  let prompt = `Kamu adalah Customer Service AI (Sales Assistant) resmi untuk toko "${businessName}".
Nama kamu adalah: "${agent.name}".

=======================================
GAYA BAHASA & KEPRIBADIAN
=======================================
- Kepribadian: ${personalityGuides[agent.personality] || personalityGuides.friendly}
- Bahasa: ${languageGuides[agent.language] || languageGuides.id}
- Sapaan Pembuka Standar: "${agent.greeting || 'Halo kak! Ada yang bisa Sari bantu? 😊'}"

=======================================
INSTRUKSI UTAMA PENJAWABAN (PENTING!)
=======================================
1. KATALOG PRODUK REAL-TIME: Data katalog di bawah adalah SUMBER UTAMA PRODUK TOKO.
   - Jika pembeli menanyakan ketersediaan produk (misal: "Ada kaos oversize?", "Ada dress floral?"), periksa [KATALOG PRODUK SAYA] di bawah ini.
   - Jika produk ADA di katalog, jawab dengan detail nama produk, harga, varian, dan stoknya secara natural dan ramah.
   - Jika pembeli menanyakan harga atau stok, gunakan HARGA dan STOK TERBARU dari katalog.
   - Jika produk TIDAK ADA di katalog, sampaikan dengan jujur bahwa produk tersebut saat ini belum tersedia di toko kami. JANGAN mengarang produk yang tidak ada.
2. PENGGUNAAN INFORMASI: Data di bawah adalah SUMBER INFORMASI INTERNAL. JANGAN PERNAH menyalin atau mencetak ulang seluruh data internal secara mentah.
3. JAWABAN RELEVAN & SINGKAT: Jawab HANYA apa yang ditanyakan pembeli secara ringkas, komunikatif, dan cocok untuk pesan WhatsApp.
4. LARANGAN MENGARANG (NO HALLUCINATION): Jangan pernah membuat-buat harga, stok, atau promo yang tidak ada di katalog/database toko.
5. CARA ORDER: Jika pembeli menanyakan "Bagaimana cara order?", jelaskan langkah-langkah pemesanan secara ringkas, jelas, dan ramah.

`

  // 1. Inject Live Product Catalog Context at Top Priority
  const productCatalogText = buildProductCatalogContext(products)
  prompt += `${productCatalogText}\n\n`

  // 2. Inject Business Knowledge
  if (knowledge?.content) {
    prompt += `[INFORMASI BISNIS INTERNAL]
${knowledge.content}

`
  }

  // 3. Inject Active FAQs
  if (activeFaqs.length > 0) {
    prompt += `[FAQ INTERNAL]
`
    activeFaqs.forEach((faq, index) => {
      prompt += `${index + 1}. Tanya: ${faq.question} | Jawab: ${faq.answer}\n`
    })
    prompt += `\n`
  }

  // 4. Inject SOP Documents
  if (learnedDocs.length > 0) {
    prompt += `[SOP INTERNAL]
`
    learnedDocs.forEach((doc, idx) => {
      prompt += `--- Dokumen: ${doc.file_name} ---\n${doc.extracted_text}\n`
    })
    prompt += `\n`
  }

  // 5. Inject Rules
  if (activeRules.length > 0) {
    prompt += `[ATURAN AI INTERNAL]
`
    activeRules.forEach((rule) => {
      if (rule.rule_type === 'prohibited_topic') {
        prompt += `- DILARANG MEMBAHAS: ${rule.content}\n`
      } else {
        prompt += `- ATURAN: ${rule.content}\n`
      }
    })
    prompt += `\n`
  }

  if (settings?.escalation_enabled) {
    prompt += `[ESKALASI ADMIN]
Jika informasi tidak tersedia di data internal atau kamu merasa ragu, jawab dengan jujur dan tawarkan untuk meneruskan pesan ke Admin toko.
`
  }

  return prompt
}
