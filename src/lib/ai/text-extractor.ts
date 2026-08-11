import mammoth from 'mammoth'

export async function extractTextFromFile(
  fileBuffer: Buffer,
  fileType: string
): Promise<{ text: string; error?: string }> {
  try {
    const ext = fileType.toLowerCase()

    if (ext === 'txt' || ext === 'text/plain') {
      const text = fileBuffer.toString('utf-8')
      return { text: text.trim() }
    }

    if (ext === 'docx' || ext === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer })
      return { text: result.value.trim() }
    }

    if (ext === 'pdf' || ext === 'application/pdf') {
      // Dynamic import pdf-parse for CJS/ESM compatibility
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(fileBuffer)
      return { text: data.text.trim() }
    }

    // Fallback: UTF-8 conversion
    const fallbackText = fileBuffer.toString('utf-8').replace(/[^\x20-\x7E\x0A\x0D]/g, ' ')
    return { text: fallbackText.trim() }
  } catch (err: any) {
    console.error('File text extraction error:', err)
    return { text: '', error: err.message || 'Gagal mengekstrak teks dari dokumen.' }
  }
}
