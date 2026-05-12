'use client'

import { useState } from 'react'
import { X, ChartBar, UserCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats } from '../types'

function getMemberColor(name: string): string {
  const nameMap: Record<string, string> = {
    'Admin': '#1a6b6b',
    'Davi': '#2e7d32',
    'João': '#5c35a0',
    'Test': '#7c4a8a'
  }
  const firstName = name.split(' ')[0]
  return nameMap[firstName] || '#1a1400'
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

  const color = getMemberColor(member.full_name || '')
  const initials = (member.full_name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const isActive = member.status === 'active' || !member.status

  const tabs: { value: Tab; label: string; icon: typeof UserCircle }[] = [
    { value: 'profile', label: 'PERFIL', icon: UserCircle },
    { value: 'performance', label: 'PERFORMANCE', icon: ChartBar },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
        {/* Hero Section */}
        <div className="bg-[#0d1a1a] p-[24px] pb-0 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-[16px] right-[16px] w-[28px] h-[28px] flex items-center justify-center bg-[#1a2a2a] border-[0.5px] border-[#2a3a3a] rounded-[6px] text-text-nav transition-all hover:text-text-primary"
          >
            <X size={13} weight="regular" />
          </button>

          <div className="flex items-center gap-4 pb-[24px]">
            <div
              className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center text-text-primary font-medium text-[14px] shrink-0"
              style={{ backgroundColor: color }}
            >
              {initials}
            </div>
            <div className="space-y-1">
              <h3 className="text-[16px] font-medium text-text-primary uppercase tracking-tight leading-none">{member.full_name}</h3>
              <div className="flex items-center gap-2 pt-1">
                <div className="bg-[#0d2e1a] border-[0.5px] border-accent-main/20 rounded-[20px] px-[11px] py-[4px] flex items-center gap-1.5">
                  <div className="w-[5px] h-[5px] rounded-full bg-accent-main" />
                  <span className="text-[9px] font-medium text-accent-main tracking-[0.1em] uppercase">ATIVO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-t-[0.5px] border-[#1a2a2a]">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-[6px] px-[16px] py-[12px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all border-b-2 -mb-[1px]",
                  activeTab === tab.value
                    ? "border-accent-main text-text-secondary"
                    : "border-transparent text-[#444] hover:text-[#666]"
                )}
              >
                <tab.icon size={14} weight="regular" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-[24px] py-[10px]">
          {activeTab === 'profile' && (
            <div className="flex flex-col">
              <InfoRow label="EMAIL" value={member.email} />
              <InfoRow label="TELEFONE" value={member.phone} />
              <InfoRow label="ESPECIALIDADE" value={member.specialty?.replace('_', ' ')} />
              <InfoRow label="MEMBRO DESDE" value={member.created_at ? new Date(member.created_at).toLocaleDateString('pt-BR') : undefined} />
              <InfoRow label="CARGO" value={member.role === 'admin' ? 'ADMINISTRADOR' : 'BARBEIRO'} isLast />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="flex flex-col">
              <InfoRow label="AGENDAMENTOS HOJE" value={String(member.todayAppointments)} />
              <InfoRow label="RATING MÉDIO" value={member.avgRating > 0 ? `${member.avgRating} ★` : undefined} />
              <InfoRow label="CONCLUÍDOS MÊS" value={String(member.totalCompleted)} />
              {showRevenue && (
                <InfoRow label="RECEITA MÊS" value={formatCurrency(member.monthRevenue)} isLast />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, isLast }: { label: string; value?: string; isLast?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between py-[14px]",
      !isLast && "border-bottom border-b-[0.5px] border-border-main/50"
    )}>
      <span className="text-[9px] font-medium text-[#383838] tracking-[0.12em] uppercase">{label}</span>
      <span className={cn(
        "text-[11px] font-medium uppercase",
        value ? "text-text-muted" : "text-[#2e2e2e]"
      )}>
        {value || 'NÃO INFORMADO'}
      </span>
    </div>
  )
}
