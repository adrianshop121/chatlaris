'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { AgentIdentityStep } from '@/components/ai-agent/agent-identity-step'
import { KnowledgeBaseStep } from '@/components/ai-agent/knowledge-base-step'
import { OperatingHoursStep } from '@/components/ai-agent/operating-hours-step'
import { TestSimulator } from '@/components/ai-agent/test-simulator'
import { DeployModal, PauseModal } from '@/components/ai-agent/deploy-modal'
import { AIAgent, AIBusinessKnowledge, AIFAQ, AIRule, AIOperatingHours, AISettings, AIKnowledgeDocument } from '@/types/database.types'
import {
  Bot,
  UserCheck,
  BookOpen,
  Clock,
  Save,
  CheckCircle2,
  Rocket,
  Pause,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'

import { fetchBusinessProducts, FullProduct } from '@/lib/supabase/products-db'

export default function AIAgentBuilderPage() {
  const { business, subscription } = useAuth()

  const [products, setProducts] = useState<FullProduct[]>([])

  useEffect(() => {
    async function loadProducts() {
      const list = await fetchBusinessProducts(business?.id || 'default')
      setProducts(list)
    }
    loadProducts()
  }, [business?.id])

  const [currentStep, setCurrentStep] = useState<number>(1)

  // Agent State
  const [agent, setAgent] = useState<AIAgent>({
    id: 'agent_default',
    business_id: business?.id || 'default',
    name: 'Sari',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    personality: 'friendly',
    language: 'id',
    greeting: 'Halo kak! Ada yang bisa Sari bantu? 😊',
    status: 'draft',
    deployed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  // Knowledge State
  const [businessKnowledge, setBusinessKnowledge] = useState<string>(
    `Nama Toko: ${business?.name || 'Toko Kami'}\nJenis Produk: Fashion & Aksesoris\nPengiriman: JNE, J&T, SiCepat\nMetode Bayar: BCA, Mandiri, GoPay`
  )

  // FAQs State
  const [faqs, setFaqs] = useState<AIFAQ[]>([
    {
      id: 'faq_1',
      business_id: business?.id || 'default',
      agent_id: 'agent_default',
      question: 'Berapa lama pengiriman?',
      answer: 'Pengiriman 2-3 hari kerja untuk JNE REG.',
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'faq_2',
      business_id: business?.id || 'default',
      agent_id: 'agent_default',
      question: 'Bisa retur tidak?',
      answer: 'Bisa retur dalam 3 hari kerja setelah barang diterima.',
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])

  // Rules State
  const [rules, setRules] = useState<AIRule[]>([
    {
      id: 'rule_1',
      business_id: business?.id || 'default',
      agent_id: 'agent_default',
      rule_type: 'prohibited_topic',
      content: 'Jangan bahas brand kompetitor lain.',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ])

  // Operating Hours State
  const [active24Hours, setActive24Hours] = useState<boolean>(true)
  const [afterHoursMessage, setAfterHoursMessage] = useState<string>(
    'Maaf kak, toko kami sedang tutup. Pesan kamu akan dibalas segera saat jam buka! 🙏'
  )
  const [operatingHours, setOperatingHours] = useState<AIOperatingHours[]>([
    { id: 'h_0', business_id: business?.id || 'default', agent_id: 'agent_default', day_of_week: 0, is_open: false, start_time: '08:00', end_time: '17:00', created_at: '', updated_at: '' },
    { id: 'h_1', business_id: business?.id || 'default', agent_id: 'agent_default', day_of_week: 1, is_open: true, start_time: '08:00', end_time: '21:00', created_at: '', updated_at: '' },
    { id: 'h_2', business_id: business?.id || 'default', agent_id: 'agent_default', day_of_week: 2, is_open: true, start_time: '08:00', end_time: '21:00', created_at: '', updated_at: '' },
    { id: 'h_3', business_id: business?.id || 'default', agent_id: 'agent_default', day_of_week: 3, is_open: true, start_time: '08:00', end_time: '21:00', created_at: '', updated_at: '' },
    { id: 'h_4', business_id: business?.id || 'default', agent_id: 'agent_default', day_of_week: 4, is_open: true, start_time: '08:00', end_time: '21:00', created_at: '', updated_at: '' },
    { id: 'h_5', business_id: business?.id || 'default', agent_id: 'agent_default', day_of_week: 5, is_open: true, start_time: '08:00', end_time: '21:00', created_at: '', updated_at: '' },
    { id: 'h_6', business_id: business?.id || 'default', agent_id: 'agent_default', day_of_week: 6, is_open: true, start_time: '08:00', end_time: '17:00', created_at: '', updated_at: '' },
  ])

  // Documents State
  const [documents, setDocuments] = useState<AIKnowledgeDocument[]>([])

  // Escalation State
  const [escalationEnabled, setEscalationEnabled] = useState<boolean>(true)

  // Test session counter
  const [completedTestCount, setCompletedTestCount] = useState<number>(0)

  // Save UI states
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // Modals
  const [deployModalOpen, setDeployModalOpen] = useState<boolean>(false)
  const [pauseModalOpen, setPauseModalOpen] = useState<boolean>(false)

  // Load from local storage for persistence across refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAgent = localStorage.getItem('chatlaris_ai_agent')
      if (savedAgent) {
        try {
          const parsed = JSON.parse(savedAgent)
          if (parsed.agent) setAgent(parsed.agent)
          if (parsed.knowledge) setBusinessKnowledge(parsed.knowledge)
          if (parsed.faqs) setFaqs(parsed.faqs)
          if (parsed.rules) setRules(parsed.rules)
          if (parsed.documents) setDocuments(parsed.documents)
          if (parsed.completedTestCount) setCompletedTestCount(parsed.completedTestCount)
        } catch (e) {
          console.warn('Error loading saved AI Agent:', e)
        }
      }
    }
  }, [])

  const handleSaveAll = () => {
    setIsSaving(true)

    const payload = {
      agent,
      knowledge: businessKnowledge,
      faqs,
      rules,
      documents,
      completedTestCount,
      updated_at: new Date().toISOString(),
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('chatlaris_ai_agent', JSON.stringify(payload))
    }

    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    }, 600)
  }

  const handleDeployConfirm = () => {
    const updatedAgent: AIAgent = {
      ...agent,
      status: 'active',
      deployed_at: new Date().toISOString(),
    }
    setAgent(updatedAgent)

    if (typeof window !== 'undefined') {
      const payload = {
        agent: updatedAgent,
        knowledge: businessKnowledge,
        faqs,
        rules,
        documents,
        completedTestCount,
        updated_at: new Date().toISOString(),
      }
      localStorage.setItem('chatlaris_ai_agent', JSON.stringify(payload))
    }
  }

  const handlePauseConfirm = () => {
    const updatedAgent: AIAgent = {
      ...agent,
      status: 'paused',
    }
    setAgent(updatedAgent)

    if (typeof window !== 'undefined') {
      const payload = {
        agent: updatedAgent,
        knowledge: businessKnowledge,
        faqs,
        rules,
        documents,
        completedTestCount,
        updated_at: new Date().toISOString(),
      }
      localStorage.setItem('chatlaris_ai_agent', JSON.stringify(payload))
    }
  }

  const getStatusBadge = () => {
    switch (agent.status) {
      case 'active':
        return <Badge variant="success" size="md">Aktif ✅</Badge>
      case 'paused':
        return <Badge variant="warning" size="md">Dijeda ⏸️</Badge>
      case 'ready':
        return <Badge variant="info" size="md">Siap Deploy 🚀</Badge>
      default:
        return <Badge variant="gray" size="md">Draft ✏️</Badge>
    }
  }

  const wizardSteps = [
    { num: 1, label: 'Identitas AI', icon: <UserCheck className="w-4 h-4" /> },
    { num: 2, label: 'Pengetahuan Bisnis', icon: <BookOpen className="w-4 h-4" /> },
    { num: 3, label: 'Jam & Batasan', icon: <Clock className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">Latih AI Kamu</h1>
            {getStatusBadge()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Ajari AI tentang bisnis kamu sebelum membiarkannya menjawab customer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Tersimpan!
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
            onClick={handleSaveAll}
          >
            Simpan Perubahan
          </Button>

          {agent.status === 'active' ? (
            <Button
              variant="danger"
              size="sm"
              icon={<Pause className="w-4 h-4" />}
              onClick={() => setPauseModalOpen(true)}
            >
              Jeda AI
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={<Rocket className="w-4 h-4" />}
              disabled={completedTestCount < 5}
              onClick={() => setDeployModalOpen(true)}
            >
              Deploy AI
            </Button>
          )}
        </div>
      </div>

      {/* 3-Step Wizard Navigation */}
      <div className="grid grid-cols-3 gap-3">
        {wizardSteps.map((s) => {
          const isActive = currentStep === s.num
          const isDone = currentStep > s.num
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`p-3.5 rounded-xl border transition-all text-left flex items-center gap-3 cursor-pointer ${
                isActive
                  ? 'border-[#128C7E] bg-[#128C7E] text-white shadow-md'
                  : isDone
                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-[#25D366] text-white'
                    : isDone
                    ? 'bg-[#128C7E] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {isDone ? '✓' : s.num}
              </div>
              <div className="min-w-0 hidden sm:block">
                <p className="text-xs font-bold truncate">{s.label}</p>
                <p className="text-[10px] opacity-80 truncate">
                  {s.num === 1 ? 'Foto, Nama & Gaya' : s.num === 2 ? 'Info, FAQ & SOP' : 'Jam & Rule'}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Content Layout: Step Wizard Form (Left) & Real-Time Test Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Step Wizard Form) */}
        <div className="lg:col-span-7 space-y-6">
          {currentStep === 1 && (
            <AgentIdentityStep
              name={agent.name}
              setName={(n) => setAgent((prev) => ({ ...prev, name: n }))}
              personality={agent.personality}
              setPersonality={(p) => setAgent((prev) => ({ ...prev, personality: p }))}
              language={agent.language}
              setLanguage={(l) => setAgent((prev) => ({ ...prev, language: l }))}
              greeting={agent.greeting || ''}
              setGreeting={(g) => setAgent((prev) => ({ ...prev, greeting: g }))}
              avatarUrl={agent.avatar_url}
              setAvatarUrl={(url) => setAgent((prev) => ({ ...prev, avatar_url: url }))}
            />
          )}

          {currentStep === 2 && (
            <KnowledgeBaseStep
              businessKnowledge={businessKnowledge}
              setBusinessKnowledge={setBusinessKnowledge}
              faqs={faqs}
              setFaqs={setFaqs}
              documents={documents}
              setDocuments={setDocuments}
              userPlan={subscription?.plan || 'free'}
            />
          )}

          {currentStep === 3 && (
            <OperatingHoursStep
              active24Hours={active24Hours}
              setActive24Hours={setActive24Hours}
              afterHoursMessage={afterHoursMessage}
              setAfterHoursMessage={setAfterHoursMessage}
              operatingHours={operatingHours}
              setOperatingHours={setOperatingHours}
              rules={rules}
              setRules={setRules}
              escalationEnabled={escalationEnabled}
              setEscalationEnabled={setEscalationEnabled}
            />
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              disabled={currentStep === 1}
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => setCurrentStep((c) => Math.max(1, c - 1))}
            >
              Sebelumnya
            </Button>

            {currentStep < 3 ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setCurrentStep((c) => Math.min(3, c + 1))}
              >
                Lanjut Step {currentStep + 1}
              </Button>
            ) : (
              <Button variant="primary" size="sm" icon={<Save className="w-4 h-4" />} onClick={handleSaveAll}>
                Simpan & Uji AI
              </Button>
            )}
          </div>
        </div>

        {/* Right Column (Simulator) */}
        <div className="lg:col-span-5 h-full">
          <div className="sticky top-20">
            <TestSimulator
              agent={agent}
              businessName={business?.name || 'Toko Kami'}
              knowledge={{
                id: 'k_1',
                business_id: business?.id || 'default',
                agent_id: agent.id,
                content: businessKnowledge,
                version: 1,
                created_at: '',
                updated_at: '',
              }}
              faqs={faqs}
              rules={rules}
              operatingHours={operatingHours}
              settings={{
                id: 's_1',
                business_id: business?.id || 'default',
                agent_id: agent.id,
                share_price_without_request: false,
                active_24_hours: active24Hours,
                after_hours_message: afterHoursMessage,
                escalation_enabled: escalationEnabled,
                uncertainty_threshold: 0.7,
                created_at: '',
                updated_at: '',
              }}
              documents={documents}
              products={products}
              completedTestCount={completedTestCount}
              setCompletedTestCount={setCompletedTestCount}
              onOpenDeployModal={() => setDeployModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Deploy & Pause Modals */}
      <DeployModal
        isOpen={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        agent={agent}
        faqCount={faqs.filter((f) => f.is_active).length}
        docCount={documents.filter((d) => d.status === 'learned').length}
        testCount={completedTestCount}
        onConfirmDeploy={handleDeployConfirm}
      />

      <PauseModal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        agentName={agent.name}
        onConfirmPause={handlePauseConfirm}
      />
    </div>
  )
}
