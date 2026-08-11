import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromFile } from '@/lib/ai/text-extractor'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const businessId = formData.get('businessId') as string | null
    const plan = (formData.get('plan') as string) || 'free'

    if (!file) {
      return NextResponse.json({ error: 'File dokumen tidak ditemukan.' }, { status: 400 })
    }

    // Plan check: Free plan users cannot upload SOP documents per Section 26
    if (plan === 'free') {
      return NextResponse.json(
        { error: 'Upload SOP tersedia di paket Pro. Silakan upgrade paket Anda.' },
        { status: 403 }
      )
    }

    // Size limit check: Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file melebihi batas maksimal 10MB.' }, { status: 400 })
    }

    // Extension check
    const fileName = file.name
    const ext = fileName.split('.').pop()?.toLowerCase() || ''

    if (!['pdf', 'docx', 'txt'].includes(ext)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Harap upload file PDF, DOCX, atau TXT.' },
        { status: 400 }
      )
    }

    // Convert file to ArrayBuffer -> Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Extract text
    const extractionResult = await extractTextFromFile(buffer, ext)

    if (extractionResult.error || !extractionResult.text) {
      return NextResponse.json({
        id: 'doc_' + Math.random().toString(36).substring(2, 9),
        file_name: fileName,
        file_path: `documents/${fileName}`,
        file_type: ext.toUpperCase(),
        file_size: file.size,
        status: 'failed',
        error_message: extractionResult.error || 'Gagal mengekstrak konten dokumen.',
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      id: 'doc_' + Math.random().toString(36).substring(2, 9),
      file_name: fileName,
      file_path: `documents/${fileName}`,
      file_type: ext.toUpperCase(),
      file_size: file.size,
      status: 'learned',
      extracted_text: extractionResult.text,
      created_at: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Document processing error:', err)
    return NextResponse.json(
      { error: err.message || 'Gagal memproses dokumen. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
