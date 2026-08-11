'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { ComingSoonModal } from '@/components/ui/coming-soon-modal'
import { AIFAQ, AIKnowledgeDocument } from '@/types/database.types'
import {
  FileText,
  HelpCircle,
  ShoppingBag,
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
} from 'lucide-react'

interface KnowledgeBaseStepProps {
  businessKnowledge: string
  setBusinessKnowledge: (v: string) => void
  faqs: AIFAQ[]
  setFaqs: React.Dispatch<React.SetStateAction<AIFAQ[]>>
  documents: AIKnowledgeDocument[]
  setDocuments: React.Dispatch<React.SetStateAction<AIKnowledgeDocument[]>>
  userPlan?: string
}

export function KnowledgeBaseStep({
  businessKnowledge,
  setBusinessKnowledge,
  faqs,
  setFaqs,
  documents,
  setDocuments,
  userPlan = 'free',
}: KnowledgeBaseStepProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'faq' | 'products' | 'sop'>('info')

  // FAQ Modal states
  const [faqModalOpen, setFaqModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<AIFAQ | null>(null)
  const [faqQuestion, setFaqQuestion] = useState('')
  const [faqAnswer, setFaqAnswer] = useState('')

  // Uploading state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

  // Coming soon modal
  const [comingSoonModal, setComingSoonModal] = useState(false)

  const defaultBusinessTemplate = `Nama Toko: Toko Baju Sari
Jenis Produk: Baju wanita, dress, blouse
Target Pelanggan: Wanita 18-35 tahun
Keunggulan Produk: Bahan premium, jahitan rapi
Cara Order: Chat WA, sebutkan nama produk + ukuran + warna
Metode Bayar: Transfer BCA, GoPay, OVO
Pengiriman: JNE, J&T, SiCepat
Jam Operasional: Senin-Sabtu 08.00-21.00 WIB`

  const faqTemplates = [
    { question: 'Berapa lama pengiriman?', answer: 'Pengiriman 2-3 hari kerja untuk JNE REG.' },
    { question: 'Bisa retur tidak?', answer: 'Bisa retur dalam 3 hari kerja setelah barang diterima.' },
    { question: 'Ada diskon khusus?', answer: 'Ada promo spesial setiap hari Jumat! Silakan cek catalog.' },
  ]

  const handleOpenFaqModal = (faq?: AIFAQ) => {
    if (faq) {
      setEditingFaq(faq)
      setFaqQuestion(faq.question)
      setFaqAnswer(faq.answer)
    } else {
      setEditingFaq(null)
      setFaqQuestion('')
      setFaqAnswer('')
    }
    setFaqModalOpen(true)
  }

  const handleSaveFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return

    if (editingFaq) {
      setFaqs((prev) =>
        prev.map((f) => (f.id === editingFaq.id ? { ...f, question: faqQuestion, answer: faqAnswer } : f))
      )
    } else {
      const newFaq: AIFAQ = {
        id: 'faq_' + Math.random().toString(36).substring(2, 9),
        business_id: 'default',
        agent_id: 'default',
        question: faqQuestion,
        answer: faqAnswer,
        is_active: true,
        sort_order: faqs.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setFaqs((prev) => [...prev, newFaq])
    }

    setFaqModalOpen(false)
  }

  const handleDeleteFaq = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id))
  }

  const handleToggleFaq = (id: string) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, is_active: !f.is_active } : f)))
  }

  const handleInsertFaqTemplate = (tmpl: { question: string; answer: string }) => {
    const newFaq: AIFAQ = {
      id: 'faq_' + Math.random().toString(36).substring(2, 9),
      business_id: 'default',
      agent_id: 'default',
      question: tmpl.question,
      answer: tmpl.answer,
      is_active: true,
      sort_order: faqs.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setFaqs((prev) => [...prev, newFaq])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)

    // Check plan: Free plan users show upgrade prompt
    if (userPlan === 'free') {
      setUpgradeModalOpen(true)
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('plan', userPlan)

    try {
      const res = await fetch('/api/ai/process-document', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      setIsUploading(false)

      if (!res.ok) {
        setUploadError(data.error || 'Gagal memproses dokumen.')
        return
      }

      setDocuments((prev) => [data, ...prev])
    } catch (err: any) {
      setIsUploading(false)
      setUploadError(err.message || 'Gagal memproses dokumen.')
    }
  }

  const handleDeleteDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        {[
          { id: 'info', label: 'Info Bisnis', icon: <FileText className="w-4 h-4" /> },
          { id: 'faq', label: `FAQ (${faqs.length})`, icon: <HelpCircle className="w-4 h-4" /> },
          { id: 'products', label: 'Produk', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'sop', label: `Dokumen SOP (${documents.length})`, icon: <UploadCloud className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === t.id
                ? 'border-[#128C7E] text-[#128C7E] bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: INFO BISNIS */}
      {activeTab === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle>Informasi Bisnis Utama</CardTitle>
            <CardDescription>
              Semakin lengkap informasi bisnis kamu, semakin akurat jawaban AI.
            </CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Detail Toko & Kebijakan
                </label>
                <button
                  type="button"
                  onClick={() => setBusinessKnowledge(defaultBusinessTemplate)}
                  className="text-xs text-[#128C7E] font-semibold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gunakan Template UMKM
                </button>
              </div>

              <textarea
                className="w-full text-sm font-mono rounded-lg border border-gray-300 p-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E] leading-relaxed"
                rows={10}
                placeholder={defaultBusinessTemplate}
                value={businessKnowledge}
                onChange={(e) => setBusinessKnowledge(e.target.value)}
              />
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#128C7E] shrink-0 mt-0.5" />
              <p>
                <strong>Tips AI:</strong> Sertakan jenis barang, lokasi pengiriman, cara pembayaran, dan garansi toko Anda di atas.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: FAQ */}
      {activeTab === 'faq' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pertanyaan Umum (FAQ)</CardTitle>
              <CardDescription>Tambah FAQ agar AI langsung memberikan jawaban pasti.</CardDescription>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => handleOpenFaqModal()}
            >
              Tambah FAQ
            </Button>
          </CardHeader>

          <div className="space-y-4">
            {/* Quick template suggestions */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-700">Template FAQ Cepat:</span>
              <div className="flex flex-wrap gap-2">
                {faqTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleInsertFaqTemplate(tmpl)}
                    className="text-xs px-3 py-1.5 bg-white border border-gray-300 hover:border-[#128C7E] hover:text-[#128C7E] rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    + {tmpl.question}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQ List */}
            {faqs.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-900">Belum Ada FAQ</h4>
                <p className="text-xs text-gray-500 mt-1 mb-4">Tambahkan FAQ pertama kamu untuk membantu AI.</p>
                <Button variant="outline" size="sm" onClick={() => handleOpenFaqModal()}>
                  + Tambah FAQ
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      faq.is_active ? 'bg-white border-gray-200 shadow-2xs' : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                        <span>Q: {faq.question}</span>
                        {!faq.is_active && <Badge variant="gray">Nonaktif</Badge>}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">A: {faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="checkbox"
                        checked={faq.is_active}
                        onChange={() => handleToggleFaq(faq.id)}
                        className="w-4 h-4 text-[#128C7E] rounded border-gray-300 focus:ring-[#128C7E] cursor-pointer"
                        title="Aktifkan/Nonaktifkan FAQ"
                      />
                      <button
                        type="button"
                        onClick={() => handleOpenFaqModal(faq)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Hapus FAQ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* TAB 3: PRODUK */}
      {activeTab === 'products' && (
        <Card>
          <CardHeader>
            <CardTitle>Katalog Produk</CardTitle>
            <CardDescription>Integrasi konteks katalog produk untuk AI Agent</CardDescription>
          </CardHeader>

          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-14 h-14 bg-emerald-100 text-[#128C7E] rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-gray-900">Integrasi Produk Siap</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Produk akan otomatis tersedia di AI setelah kamu menambahkan katalog produk pada Phase 3.
              </p>
            </div>

            <Button
              variant="outline"
              size="md"
              className="font-semibold"
              onClick={() => setComingSoonModal(true)}
            >
              Lihat Katalog Produk (Segera Hadir)
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 4: SOP */}
      {activeTab === 'sop' && (
        <Card>
          <CardHeader>
            <CardTitle>Dokumen Standar Operasional (SOP)</CardTitle>
            <CardDescription>Upload dokumen PDF, DOCX, atau TXT (Maks 10MB per file).</CardDescription>
          </CardHeader>

          <div className="space-y-6">
            {uploadError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-emerald-50/30 hover:border-[#128C7E] transition-all relative">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-3 pointer-events-none">
                <div className="w-12 h-12 bg-white text-[#128C7E] rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-200">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {isUploading ? 'Memproses dan membaca teks dokumen...' : 'Klik atau seret file SOP ke sini'}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">Mendukung format PDF, DOCX, dan TXT (Maks 10MB)</p>
                </div>
              </div>
            </div>

            {/* Document List */}
            {documents.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-500">Belum ada dokumen SOP diupload.</div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Dokumen Dipelajari:</h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3.5 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-[#128C7E] rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{doc.file_name}</p>
                          <p className="text-[11px] text-gray-500">
                            {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {doc.status === 'learned' ? (
                          <Badge variant="success" size="sm">
                            <CheckCircle2 className="w-3 h-3" /> Dipelajari ✅
                          </Badge>
                        ) : doc.status === 'processing' ? (
                          <Badge variant="warning" size="sm">
                            Memproses...
                          </Badge>
                        ) : (
                          <Badge variant="error" size="sm">
                            Gagal
                          </Badge>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1 text-gray-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add / Edit FAQ Modal */}
      <Modal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={editingFaq ? 'Edit FAQ' : 'Tambah FAQ Baru'}
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Pertanyaan"
            placeholder="Berapa lama pengiriman?"
            value={faqQuestion}
            onChange={(e) => setFaqQuestion(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Jawaban FAQ
            </label>
            <textarea
              className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
              rows={3}
              placeholder="Pengiriman 2-3 hari kerja untuk JNE REG."
              value={faqAnswer}
              onChange={(e) => setFaqAnswer(e.target.value)}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <Button variant="outline" size="sm" onClick={() => setFaqModalOpen(false)}>
              Batal
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSaveFaq}>
              Simpan FAQ
            </Button>
          </div>
        </div>
      </Modal>

      {/* Free Plan Upgrade Prompt Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade ke Paket Pro 🚀"
      >
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-gray-900">Upload SOP Tersedia di Paket Pro</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Paket Free Anda saat ini hanya mencakup Basis Pengetahuan & FAQ dasar. Upgrade ke Paket Pro untuk mengunggah dokumen SOP PDF/DOCX tanpa batas.
            </p>
          </div>
          <Button variant="primary" className="w-full font-bold" onClick={() => setUpgradeModalOpen(false)}>
            Tutup
          </Button>
        </div>
      </Modal>

      {/* Coming Soon Modal */}
      <ComingSoonModal
        isOpen={comingSoonModal}
        onClose={() => setComingSoonModal(false)}
        featureName="Katalog Produk"
        description="Fitur pengelolaan Katalog & Varian Produk akan dibuka pada Phase 3."
      />
    </div>
  )
}
