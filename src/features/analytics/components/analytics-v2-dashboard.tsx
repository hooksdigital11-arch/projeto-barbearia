'use client'

import { useDashboardRealtime } from '../useDashboardRealtime'
import { 
  CurrencyDollar, 
  CalendarCheck, 
  Users, 
  TrendUp,
  Clock,
  Warning
} from '@phosphor-icons/react'

export function AnalyticsV2Dashboard({ initialData, organizationId }: { initialData: any, organizationId: string }) {
  // Ativa a sincronização em tempo real (Bônus de UX)
  useDashboardRealtime(organizationId)

  const stats = initialData || {
    revenue: 0,
    averageTicket: 0,
    appointments: { total: 0, completed: 0, canceled: 0, noShow: 0 }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black font-syne text-white tracking-tighter">
          Dashboard <span className="text-accent-cyan">Analítico V2</span>
        </h1>
        <p className="text-text-secondary font-medium">Dados agregados em tempo real via PostgreSQL Triggers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receita Card */}
        <div className="glass-card p-6 border-accent-cyan/20 bg-accent-cyan/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-accent-cyan/10 rounded-2xl text-accent-cyan">
              <CurrencyDollar size={24} weight="duotone" />
            </div>
            <span className="text-[10px] font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-1 rounded-full uppercase">Hoje</span>
          </div>
          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Receita Total</p>
          <h3 className="text-3xl font-black text-white mt-1">
            R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        {/* Ticket Médio Card */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-2xl text-white">
              <TrendUp size={24} weight="duotone" />
            </div>
          </div>
          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Ticket Médio</p>
          <h3 className="text-3xl font-black text-white mt-1">
            R$ {stats.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        {/* Agendamentos Card */}
        <div className="glass-card p-6 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/5 rounded-2xl text-white">
              <CalendarCheck size={24} weight="duotone" />
            </div>
          </div>
          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Agendamentos</p>
          <h3 className="text-3xl font-black text-white mt-1">
            {stats.appointments.total}
          </h3>
        </div>

        {/* Taxa de Conversão / Concluídos */}
        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <Clock size={24} weight="duotone" />
            </div>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase">Concluídos</span>
          </div>
          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">Taxa de Sucesso</p>
          <h3 className="text-3xl font-black text-white mt-1">
            {stats.appointments.total > 0 
              ? Math.round((stats.appointments.completed / stats.appointments.total) * 100) 
              : 0}%
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass-card p-8 border-white/5">
            <h3 className="text-xl font-bold font-syne text-white mb-6">Distribuição de Status</h3>
            <div className="space-y-4">
               <StatusItem label="Concluídos" count={stats.appointments.completed} color="bg-emerald-500" total={stats.appointments.total} />
               <StatusItem label="Cancelados" count={stats.appointments.canceled} color="bg-red-500" total={stats.appointments.total} />
               <StatusItem label="No-show" count={stats.appointments.noShow} color="bg-orange-500" total={stats.appointments.total} />
            </div>
         </div>
         
         <div className="glass-card p-8 border-accent-cyan/10 bg-accent-cyan/5 flex flex-col items-center justify-center text-center space-y-4">
            <Warning size={48} weight="duotone" className="text-accent-cyan opacity-50" />
            <div>
               <h4 className="text-lg font-bold text-white">Arquitetura de Eventos Ativa</h4>
               <p className="text-sm text-text-secondary max-w-xs mx-auto">
                  Este dashboard não faz cálculos manuais. Ele consome uma View do Postgres alimentada por Triggers.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}

function StatusItem({ label, count, color, total }: { label: string, count: number, color: string, total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className="text-white font-bold">{count}</span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
