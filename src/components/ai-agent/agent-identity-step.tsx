'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Bot, Smile, Briefcase, Sparkles, MessageSquare, Check, Globe } from 'lucide-react'

interface AgentIdentityStepProps {
  name: string
  setName: (v: string) => void
  personality: 'friendly' | 'professional' | 'playful'
  setPersonality: (v: 'friendly' | 'professional' | 'playful') => void
  language: 'id' | 'en' | 'mixed'
  setLanguage: (v: 'id' | 'en' | 'mixed') => void
  greeting: string
  setGreeting: (v: string) => void
  avatarUrl: string | null
  setAvatarUrl: (v: string | null) => void
}

export function AgentIdentityStep({
  name,
  setName,
  personality,
  setPersonality,
  language,
  setLanguage,
  greeting,
  setGreeting,
  avatarUrl,
  setAvatarUrl,
}: AgentIdentityStepProps) {
  const presetAvatars = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  ]

  const personalityCards = [
    {
      id: 'friendly',
      title: 'Friendly & Warm',
      emoji: '😊',
      icon: <Smile className="w-5 h-5 text-emerald-600" />,
      desc: 'Casual, ramah, hangat, boleh menggunakan emoji.',
      badge: 'Paling Populer',
    },
    {
      id: 'professional',
      title: 'Profesional',
      emoji: '💼',
      icon: <Briefcase className="w-5 h-5 text-sky-600" />,
      desc: 'Formal, sopan, jelas, tidak berlebihan menggunakan emoji.',
      badge: 'Resmi',
    },
    {
      id: 'playful',
      title: 'Playful',
      emoji: '😄',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      desc: 'Santai, fun, cocok untuk brand anak muda.',
      badge: 'Kreatif',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#128C7E]" />
              <span>Identitas & Foto AI</span>
            </h3>

            <div className="space-y-4">
              <Input
                label="Nama Agent"
                placeholder="Contoh: Sari"
                value={name}
                onChange={(e) => setName(e.target.value)}
                helperText="Nama yang akan digunakan AI saat menyapa pembeli."
                required
              />

              {/* Avatar Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Foto / Avatar Agent
                </label>
                <div className="flex items-center gap-3">
                  <Avatar name={name || 'Sari'} src={avatarUrl} size="xl" />
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Pilih dari ilustrasi atau avatar bawaan:</p>
                    <div className="flex items-center gap-2">
                      {presetAvatars.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Avatar preset"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-9 h-9 rounded-full object-cover border-2 cursor-pointer transition-all ${
                            avatarUrl === url ? 'border-[#128C7E] ring-2 ring-[#128C7E]/20 scale-105' : 'border-gray-200 hover:border-gray-400'
                          }`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 ml-2"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Personality Cards */}
          <Card>
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#25D366]" />
              <span>Gaya Kepribadian (Personality)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {personalityCards.map((p) => {
                const isSelected = personality === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setPersonality(p.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[#128C7E] bg-emerald-50/40 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[#128C7E] text-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{p.emoji}</div>
                    <h4 className="text-sm font-bold text-gray-900">{p.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Language & Greeting */}
          <Card>
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-600" />
              <span>Bahasa & Sapaan</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Bahasa Respon
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'id', label: 'Indonesia 🇮🇩' },
                    { id: 'en', label: 'English 🇬🇧' },
                    { id: 'mixed', label: 'Campur (Gaul) 💬' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanguage(l.id as any)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        language === l.id
                          ? 'border-[#128C7E] bg-[#128C7E] text-white shadow-xs'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sapaan Pembuka
                </label>
                <textarea
                  className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
                  rows={2}
                  placeholder="Halo kak! Ada yang bisa Sari bantu? 😊"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Live Preview Card */}
        <div>
          <div className="sticky top-20 space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Pratinjau Tampilan (Live Preview)
            </h4>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <Avatar name={name || 'Sari'} src={avatarUrl} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-gray-900">{name || 'Sari'}</h4>
                    <Badge variant="success" size="sm">
                      Online
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">Sales AI Assistant</p>
                </div>
              </div>

              {/* Chat Preview Bubble */}
              <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 text-xs text-gray-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-[#128C7E] font-bold">
                  <span>{name || 'Sari'}</span>
                  <span>Sekarang</span>
                </div>
                <p className="leading-relaxed font-medium">
                  {greeting || 'Halo kak! Ada yang bisa Sari bantu? 😊'}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span className="text-gray-400">Kepribadian:</span>
                  <span className="font-semibold text-gray-900 capitalize">{personality}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="text-gray-400">Bahasa:</span>
                  <span className="font-semibold text-gray-900 uppercase">{language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
