'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { Plus, UsersThree } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { TeamStatsCards } from './team-stats'
import { ViewToggle } from './view-toggle'
import { BarberCard } from './barber-card'
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
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Header com Design Assimétrico */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-5xl md:text-7xl font-black font-syne text-white tracking-tighter leading-none uppercase">
              Equipe<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-xl ml-7 border-l border-white/10 pl-6">
            {isAdmin 
              ? 'Gerencie sua equipe de especialistas. Acompanhe a performance individual e coordene a excelência no atendimento.' 
              : 'Veja seus colegas de equipe e acompanhe a agenda coletiva da unidade.'}
          </p>
        </div>
        <div className="flex items-center gap-4 ml-7 lg:ml-0">
          <ViewToggle view={view} setView={setView} />
        </div>
      </div>

      {/* KPI Cards (Admin only) */}
      {isAdmin ? <TeamStatsCards stats={stats} /> : null}

      {/* Barber view: Own profile highlighted */}
      {/* Barber view: Own profile highlighted */}
      {!isAdmin && currentUser ? (
        <div className="space-y-4">
          <BarberCard
            member={currentUser}
            onView={setViewingMember}
            onEdit={setEditingMember}
            canManage={false}
            showRevenue={false}
            isOwnProfile
          />
        </div>
      ) : null}

      {/* Section header for colleagues (barber view) */}
      {/* Section header for colleagues (barber view) */}
      {!isAdmin && colleagues.length > 0 ? (
        <div className="flex items-center gap-3 mt-6">
          <UsersThree size={18} className="text-muted-foreground" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Colegas</h2>
        </div>
      ) : null}

      {/* Team List */}
      <div>
        {view === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

        {(isAdmin ? members : colleagues).length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-20 text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-white/5 flex items-center justify-center mx-auto text-muted-foreground/30">
              <UsersThree size={28} weight="duotone" />
            </div>
            <div>
              <p className="text-white font-bold">Nenhum membro encontrado</p>
              <p className="text-sm text-muted-foreground">A equipe aparecerá aqui assim que houver membros cadastrados.</p>
            </div>
          </div>
        ) : null}
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
