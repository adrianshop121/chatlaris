'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { AIAgent, AIBusinessKnowledge, AIFAQ, AIRule, AIOperatingHours, AISettings, AIKnowledgeDocument } from '@/types/database.types'
import {
  MessageSquare,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
  Rocket,
  RefreshCw,
} from 'lucide-react'

interface MessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  responseTimeMs?: number
  source?: string
  rating?: 'pass' | 'fail'
  isEscalated?: boolean
  timestamp: string
}

interface TestSimulatorProps {
  agent: AIAgent
  businessName: string
  knowledge: AIBusinessKnowledge | null
  faqs: AIFAQ[]
  rules: AIRule[]
  operatingHours: AIOperatingHours[]
  settings: AISettings | null
  documents: AIKnowledgeDocument[]
  completedTestCount: number
  setCompletedTestCount: React.Dispatch<React.SetStateAction<number>>
  onOpenDeployModal: () => void
}

export function TestSimulator({
  agent,
  businessName,
  knowledge,
  faqs,
  rules,
  operatingHours,
  settings,
  documents,
  completedTestCount,
  setCompletedTestCount,
  onOpenDeployModal,
}: TestSimulatorProps) {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: agent.greeting || 'Halo kak! Ada yang bisa kami bantu? 😊',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const chatContainerRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    'Bagaimana cara order?',
    'Pengirimannya pakai apa?',
    'Bisa bayar pakai GoPay?',
    'Apakah bisa bayar pakai OVO?',
    'Halo',
    'Kasih semua informasi toko kamu',
  ]

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || isTyping) return

    const userMsg: MessageItem = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/ai/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          agent,
          businessName,
          knowledge,
          faqs,
          rules,
          operatingHours,
          settings,
          documents,
        }),
      })

      const data = await res.json()
      setIsTyping(false)

      if (data.notice) {
        setNotice(data.notice)
      }

      const aiMsg: MessageItem = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: data.response || 'Maaf kak, Sari belum bisa memproses pesan ini.',
        responseTimeMs: data.responseTimeMs,
        source: data.source,
        isEscalated: data.isEscalated,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      setIsTyping(false)
      const errMsg: MessageItem = {
        id: 'msg_' + Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: 'AI sedang mengalami kendala jaringan. Silakan coba lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errMsg])
    }
  }

  const handleRateResponse = (msgId: string, rating: 'pass' | 'fail') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          if (!m.rating) {
            setCompletedTestCount((c) => c + 1)
          }
          return { ...m, rating }
        }
        return m
      })
    )
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg_welcome_' + Date.now(),
        role: 'assistant',
        content: agent.greeting || 'Halo kak! Ada yang bisa kami bantu? 😊',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  const isEligibleToDeploy = completedTestCount >= 5

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden min-h-[550px]">
      {/* Simulator Header */}
      <div className="p-4 bg-[#128C7E] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={agent.name} src={agent.avatar_url} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">{agent.name}</h3>
              <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-bold">
                SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90">Coba tanya AI kamu sebelum deploy</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-1.5 text-emerald-100 hover:text-white hover:bg-[#18a090] rounded-lg transition-colors"
            title="Reset Chat Simulator"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Deploy Bar */}
      <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#128C7E]" />
          <span className="font-bold text-gray-800">
            Progres Pengujian: <span className="text-[#128C7E] font-black">{completedTestCount}/5 test</span>
          </span>
          {isEligibleToDeploy && <Badge variant="success">AI Siap Deploy ✅</Badge>}
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={!isEligibleToDeploy}
          icon={<Rocket className="w-3.5 h-3.5" />}
          onClick={onOpenDeployModal}
          title={!isEligibleToDeploy ? 'Uji minimal 5 percakapan terlebih dahulu.' : 'Deploy AI Agent'}
        >
          Deploy AI
        </Button>
      </div>

      {/* Chat Messages Container */}
      <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F0F2F5]">
        {notice && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 text-center">
            {notice}
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}>
              {!isUser && <Avatar name={agent.name} src={agent.avatar_url} size="sm" className="mt-1" />}

              <div className="max-w-[80%] space-y-1">
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    isUser
                      ? 'bg-[#25D366] text-white rounded-tr-none font-medium'
                      : 'bg-white text-gray-900 rounded-tl-none border border-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Metadata & Rating */}
                  {!isUser && (
                    <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between gap-2 text-[10px] text-gray-400">
                      <span>
                        AI • {msg.responseTimeMs ? `${(msg.responseTimeMs / 1000).toFixed(1)}s` : 'Realtime'}
                        {msg.isEscalated && (
                          <span className="ml-1 text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Perlu Admin
                          </span>
                        )}
                      </span>

                      {/* Pass / Fail Rating */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRateResponse(msg.id, 'pass')}
                          className={`p-1 rounded transition-colors ${
                            msg.rating === 'pass' ? 'bg-emerald-100 text-emerald-700 font-bold' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Jawaban tepat (Pass)"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRateResponse(msg.id, 'fail')}
                          className={`p-1 rounded transition-colors ${
                            msg.rating === 'fail' ? 'bg-rose-100 text-rose-700 font-bold' : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Perlu diperbaiki (Fail)"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start gap-2.5">
            <Avatar name={agent.name} src={agent.avatar_url} size="sm" />
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#128C7E]" />
              <span>{agent.name} sedang mengetik...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
          Coba Pertanyaan:
        </span>
        {quickPrompts.map((promptText, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(promptText)}
            className="text-[11px] px-2.5 py-1 bg-emerald-50/80 text-[#128C7E] border border-emerald-200 hover:bg-[#128C7E] hover:text-white rounded-full transition-colors shrink-0 cursor-pointer font-medium"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Tulis pertanyaan customer..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isTyping}
          className="flex-1 text-sm bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
        />
        <Button
          type="submit"
          variant="secondary"
          className="p-2.5 rounded-xl shrink-0"
          disabled={!input.trim() || isTyping}
          icon={<Send className="w-4 h-4" />}
        />
      </form>
    </div>
  )
}
