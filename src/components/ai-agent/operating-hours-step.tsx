'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AIRule, AIOperatingHours, AISettings } from '@/types/database.types'
import { Clock, ShieldAlert, UserCheck, Plus, Trash2 } from 'lucide-react'

interface OperatingHoursStepProps {
  active24Hours: boolean
  setActive24Hours: (v: boolean) => void
  afterHoursMessage: string
  setAfterHoursMessage: (v: string) => void
  operatingHours: AIOperatingHours[]
  setOperatingHours: React.Dispatch<React.SetStateAction<AIOperatingHours[]>>
  rules: AIRule[]
  setRules: React.Dispatch<React.SetStateAction<AIRule[]>>
  escalationEnabled: boolean
  setEscalationEnabled: (v: boolean) => void
}

export function OperatingHoursStep({
  active24Hours,
  setActive24Hours,
  afterHoursMessage,
  setAfterHoursMessage,
  operatingHours,
  setOperatingHours,
  rules,
  setRules,
  escalationEnabled,
  setEscalationEnabled,
}: OperatingHoursStepProps) {
  const [newRuleInput, setNewRuleInput] = useState('')

  const daysName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  const handleToggleDay = (dayIndex: number) => {
    setOperatingHours((prev) =>
      prev.map((h) => (h.day_of_week === dayIndex ? { ...h, is_open: !h.is_open } : h))
    )
  }

  const handleTimeChange = (dayIndex: number, field: 'start_time' | 'end_time', val: string) => {
    setOperatingHours((prev) =>
      prev.map((h) => (h.day_of_week === dayIndex ? { ...h, [field]: val } : h))
    )
  }

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return
    const newRule: AIRule = {
      id: 'rule_' + Math.random().toString(36).substring(2, 9),
      business_id: 'default',
      agent_id: 'default',
      rule_type: 'prohibited_topic',
      content: newRuleInput.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setRules((prev) => [...prev, newRule])
    setNewRuleInput('')
  }

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const handleToggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r)))
  }

  return (
    <div className="space-y-6">
      {/* Operating Hours Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#128C7E]" />
              <CardTitle>Jam Operasional AI</CardTitle>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={active24Hours}
                onChange={(e) => setActive24Hours(e.target.checked)}
                className="w-4 h-4 text-[#128C7E] rounded border-gray-300 focus:ring-[#128C7E]"
              />
              <span>AI Aktif 24 Jam Nonstop</span>
            </label>
          </div>
          <CardDescription>
            Tentukan kapan AI diizinkan menjawab customer secara otomatis.
          </CardDescription>
        </CardHeader>

        {!active24Hours && (
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {operatingHours.map((h) => (
                <div key={h.day_of_week} className="p-3 bg-white flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-[100px]">
                    <input
                      type="checkbox"
                      checked={h.is_open}
                      onChange={() => handleToggleDay(h.day_of_week)}
                      className="w-4 h-4 text-[#128C7E] rounded border-gray-300 focus:ring-[#128C7E] cursor-pointer"
                    />
                    <span className={`font-bold ${h.is_open ? 'text-gray-900' : 'text-gray-400'}`}>
                      {daysName[h.day_of_week]}
                    </span>
                  </div>

                  {h.is_open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={h.start_time || '08:00'}
                        onChange={(e) => handleTimeChange(h.day_of_week, 'start_time', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-800"
                      />
                      <span>s/d</span>
                      <input
                        type="time"
                        value={h.end_time || '21:00'}
                        onChange={(e) => handleTimeChange(h.day_of_week, 'end_time', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-800"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Tutup</span>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Pesan Saat Toko Tutup (After Hours Message)
              </label>
              <textarea
                className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#128C7E]/20 focus:border-[#128C7E]"
                rows={2}
                value={afterHoursMessage}
                onChange={(e) => setAfterHoursMessage(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {/* AI Boundaries & Prohibited Topics */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <CardTitle>Batasan AI (Prohibited Topics)</CardTitle>
          </div>
          <CardDescription>
            Masukkan topik atau kata kunci yang dilarang dijawab oleh AI.
          </CardDescription>
        </CardHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Contoh: Jangan bahas produk kompetitor X"
              value={newRuleInput}
              onChange={(e) => setNewRuleInput(e.target.value)}
            />
            <Button variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={handleAddRule}>
              Tambah Rule
            </Button>
          </div>

          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.is_active}
                    onChange={() => handleToggleRule(rule.id)}
                    className="w-4 h-4 text-[#128C7E] rounded border-gray-300 focus:ring-[#128C7E] cursor-pointer"
                  />
                  <span className={`font-semibold ${rule.is_active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                    {rule.content}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Escalation to Admin */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-600" />
              <CardTitle>Teruskan ke Admin (Escalation)</CardTitle>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={escalationEnabled}
                onChange={(e) => setEscalationEnabled(e.target.checked)}
                className="w-4 h-4 text-[#128C7E] rounded border-gray-300 focus:ring-[#128C7E]"
              />
              <span>Aktifkan Eskalasi</span>
            </label>
          </div>
          <CardDescription>
            Jika AI tidak yakin atau informasi tidak tersedia di basis pengetahuan, AI akan menyarankan eskalasi ke Admin toko secara otomatis.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
