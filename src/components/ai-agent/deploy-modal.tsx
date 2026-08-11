'use client'

import React from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AIAgent } from '@/types/database.types'
import { Rocket, Pause, Sparkles, CheckCircle2 } from 'lucide-react'

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
  agent: AIAgent
  faqCount: number
  docCount: number
  testCount: number
  onConfirmDeploy: () => void
}

export function DeployModal({
  isOpen,
  onClose,
  agent,
  faqCount,
  docCount,
  testCount,
  onConfirmDeploy,
}: DeployModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Kamu Siap Bekerja 🚀">
      <div className="space-y-4 py-2">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
          <div className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <Rocket className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-gray-900">Aktifkan {agent.name}</h4>
          <p className="text-xs text-gray-600">
            AI Agent telah lulus minimal 5 pengujian simulator dan siap merespon pertanyaan customer.
          </p>
        </div>

        {/* Configuration Summary */}
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden text-xs">
          <div className="p-3 bg-gray-50 flex justify-between">
            <span className="text-gray-500">Nama Agent:</span>
            <span className="font-bold text-gray-900">{agent.name}</span>
          </div>
          <div className="p-3 bg-white flex justify-between">
            <span className="text-gray-500">Gaya Kepribadian:</span>
            <span className="font-bold text-gray-900 capitalize">{agent.personality}</span>
          </div>
          <div className="p-3 bg-gray-50 flex justify-between">
            <span className="text-gray-500">Jumlah FAQ Aktif:</span>
            <span className="font-bold text-gray-900">{faqCount} FAQ</span>
          </div>
          <div className="p-3 bg-white flex justify-between">
            <span className="text-gray-500">Dokumen SOP:</span>
            <span className="font-bold text-gray-900">{docCount} Dokumen</span>
          </div>
          <div className="p-3 bg-gray-50 flex justify-between">
            <span className="text-gray-500">Pengujian Simulator:</span>
            <Badge variant="success">{testCount} Pengujian Selesai ✅</Badge>
          </div>
        </div>

        <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-800 leading-relaxed">
          <strong>Catatan Phase 2:</strong> AI sudah aktif untuk simulasi. Integrasi gateway resmi WhatsApp akan tersedia pada tahap berikutnya.
        </div>

        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" className="w-1/3" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            className="w-2/3 font-bold"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => {
              onConfirmDeploy()
              onClose()
            }}
          >
            Deploy Sekarang
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface PauseModalProps {
  isOpen: boolean
  onClose: () => void
  agentName: string
  onConfirmPause: () => void
}

export function PauseModal({ isOpen, onClose, agentName, onConfirmPause }: PauseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Jeda AI Agent?">
      <div className="space-y-4 py-2">
        <p className="text-xs text-gray-600 leading-relaxed">
          Apakah Anda yakin ingin menjeda <span className="font-bold text-gray-900">{agentName}</span>? AI tidak akan memberikan respon otomatis selama status dijeda.
        </p>

        <div className="pt-2 flex items-center gap-2">
          <Button variant="outline" className="w-1/2" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="danger"
            className="w-1/2 font-bold"
            icon={<Pause className="w-4 h-4" />}
            onClick={() => {
              onConfirmPause()
              onClose()
            }}
          >
            Jeda AI
          </Button>
        </div>
      </div>
    </Modal>
  )
}
