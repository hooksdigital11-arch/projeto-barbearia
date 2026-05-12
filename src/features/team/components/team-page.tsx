'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Plus, UsersThree } from '@phosphor-icons/react'
import { TeamStatsCards } from './team-stats'
import { ViewToggle } from './view-toggle'
import { BarberCard } from './barber-card'
import { cn } from '@/lib/utils/cn'
import type { TeamMemberWithStats, TeamStats } from '../types'

const BarberTable = dynamic(() => import('./barber-table').then(m => m.BarberTable), { ssr: false })
const BarberDetailModal = dynamic(() => import('./barber-detail-modal').then(m => m.BarberDetailModal), { ssr: false })
const EditBarberModal = dynamic(() => import('./edit-barber-modal').then(m => m.EditBarberModal), { ssr: false })

interface TeamPageProps {
  members: TeamMemberWithStats[]
  stats: TeamStats
  userRole: 'admin' | 'barber'
  currentUserId: string
}

export function TeamPage({ members, stats, userRole, currentUserId }: TeamPageProps) {
  const [view, setView] = useState<'cards' | 'table'>('cards')
  const [viewingMember, setViewingMember] = useState<TeamMemberWithStats | null>(null)
  const [editingMember, setEditingMember] = useState<TeamMemberWithStats | null>(null)

  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem('team-view')
    if (saved === 'cards' || saved === 'table') setView(saved)
  }, [])

  useEffect(() => {
    localStorage.setItem('team-view', view)
  }, [view])

  const isAdmin = userRole === 'admin'
  const currentUser = members.find(m => m.id === currentUserId)
  const colleagues = members.filter(m => m.id !== currentUserId)

  return (
    <div className="animate-premium-in py-8 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-[32px] font-medium text-text-primary tracking-[-0.02em] uppercase">
            EQUIPE<span className="text-accent-main">.</span>
          </h1>
          <p className="text-[11px] text-[#333] leading-[1.5] max-w-[480px] font-medium uppercase tracking-wide">
            {isAdmin 
              ? 'Gerencie sua equipe de especialistas. Acompanhe a performance individual e coordene a excelência no atendimento.' 
              : 'Veja seus colegas de equipe e acompanhe a agenda coletiva da unidade.'}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>

      {/* KPI Cards (Admin only) */}
      {isAdmin ? <TeamStatsCards stats={stats} /> : null}

      {/* Team List */}
      <div className="space-y-6">
        {/* Barber view: Own profile header */}
        {!isAdmin && currentUser && (
          <div className="space-y-4">
             <div className="flex items-center gap-3">
              <div className="w-[4px] h-[4px] rounded-full bg-accent-cyan" />
              <h2 className="text-[10px] font-medium text-accent-cyan uppercase tracking-[0.2em]">Seu Perfil</h2>
            </div>
            <BarberCard
              member={currentUser}
              onView={setViewingMember}
              onEdit={setEditingMember}
              canManage={false}
              showRevenue={false}
              isOwnProfile
            />
          </div>
        )}

        {/* Section header for colleagues (barber view) */}
        {!isAdmin && colleagues.length > 0 && (
          <div className="flex items-center gap-3 mt-12 mb-6">
            <div className="w-[4px] h-[4px] rounded-full bg-[#333]" />
            <h2 className="text-[10px] font-medium text-[#333] uppercase tracking-[0.2em]">Colegas de Equipe</h2>
          </div>
        )}

        {view === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px]">
            {(isAdmin ? members : colleagues).map(member => (
              <BarberCard
                key={member.id}
                member={member}
                onView={setViewingMember}
                onEdit={setEditingMember}
                canManage={isAdmin}
                showRevenue={isAdmin}
              />
            ))}
          </div>
        ) : (
          <BarberTable
            members={isAdmin ? members : colleagues}
            onView={setViewingMember}
            onEdit={setEditingMember}
            canManage={isAdmin}
            showRevenue={isAdmin}
          />
        )}

        {(isAdmin ? members : colleagues).length === 0 && (
          <div className="bg-bg-sidebar border-[0.5px] border-dashed border-border-main rounded-[10px] p-[60px] text-center">
            <UsersThree size={32} weight="regular" className="text-[#1e1e1e] mx-auto mb-4" />
            <p className="text-[10px] font-medium text-[#222] tracking-[0.1em] uppercase">Nenhum membro encontrado</p>
          </div>
        )}
      </div>

      {/* Modais */}
      <BarberDetailModal
        isOpen={!!viewingMember}
        onClose={() => setViewingMember(null)}
        member={viewingMember}
        showRevenue={isAdmin}
      />

      <EditBarberModal
        isOpen={!!editingMember}
        onClose={() => setEditingMember(null)}
        member={editingMember}
        canChangeStatus={isAdmin}
      />
    </div>
  )
}
