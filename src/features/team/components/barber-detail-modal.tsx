'use client'

import { useState, useTransition } from 'react'
import { X, CalendarCheck, ChartBar, Clock, Star, CircleNotch, UserCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats } from '../types'

function hashColor(name: string): string {
  const knownColors: Record<string, string> = { 'Rafael': '#3b82f6', 'Thiago': '#f59e0b', 'Marcos': '#10b981' }
  const firstName = (name || '').split(' ')[0]
  if (knownColors[firstName]) return knownColors[firstName]
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = (name || '').charCodeAt(i) + ((hash << 5) - hash)
  const colors = ['#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#a78bfa']
  return colors[Math.abs(hash) % colors.length]
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

type Tab = 'profile' | 'performance'

interface BarberDetailModalProps {
  isOpen: boolean
  onClose: () => void
  member: TeamMemberWithStats | null
  showRevenue: boolean
}

export function BarberDetailModal({ isOpen, onClose, member, showRevenue }: BarberDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  if (!isOpen || !member) return null

  const color = hashColor(member.full_name || '')
  const initials = (member.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const isActive = member.status === 'active' || !member.status

  const tabs: { value: Tab; label: string; icon: typeof UserCircle }[] = [
    { value: 'profile', label: 'Perfil', icon: UserCircle },
    { value: 'performance', label: 'Performance', icon: ChartBar },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#141414] border border-white/10 rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8 overflow-hidden">
        {/* Header with color */}
        <div className="relative h-24" style={{ backgroundColor: `${color}20` }}>
          <div className="absolute -bottom-8 left-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl border-4 border-[#141414]"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Name & status */}
        <div className="px-8 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white font-syne">{member.full_name}</h3>
              {member.specialty && (
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider mt-1 inline-block" style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
                  {member.specialty === 'corte_barba' ? 'Corte + Barba' : member.specialty}
                </span>
              )}
            </div>
            <span className={cn(
              "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest",
              isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}>
              {isActive ? '● Ativo' : '● Inativo'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div className="flex border-b border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-[1px]",
                  activeTab === tab.value
                    ? "border-accent-cyan text-accent-cyan"
                    : "border-transparent text-muted-foreground hover:text-white"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8 min-h-[250px]">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <InfoRow label="Email" value={member.email || '—'} />
              <InfoRow label="Telefone" value={member.phone || '—'} />
              <InfoRow label="Especialidade" value={member.specialty === 'corte_barba' ? 'Corte + Barba' : member.specialty || '—'} />
              <InfoRow label="Membro desde" value={member.created_at ? new Date(member.created_at).toLocaleDateString('pt-BR') : '—'} />
              <InfoRow label="Cargo" value={member.role === 'admin' ? 'Administrador' : 'Barbeiro'} />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatBox icon={CalendarCheck} label="Hoje" value={`${member.todayAppointments} agend.`} color="text-blue-400" />
                <StatBox icon={Star} label="Rating" value={member.avgRating > 0 ? `${member.avgRating} ★` : '—'} color="text-amber-400" />
                <StatBox icon={Clock} label="Concluídos" value={`${member.totalCompleted} mês`} color="text-green-400" />
                {showRevenue && (
                  <StatBox icon={ChartBar} label="Receita Mês" value={formatCurrency(member.monthRevenue)} color="text-accent-cyan" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  )
}

function StatBox({ icon: Icon, label, value, color }: { icon: typeof Star; label: string; value: string; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
      <Icon size={20} weight="duotone" className={cn(color, "mx-auto mb-2")} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-lg font-bold text-white mt-1">{value}</p>
    </div>
  )
}
