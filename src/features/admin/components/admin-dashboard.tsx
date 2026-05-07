import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { 
  CurrencyDollar, 
  CalendarCheck, 
  UserPlus, 
  Ticket,
  ChartLineUp,
  Users
} from '@phosphor-icons/react/dist/ssr'
import { getAdminKPIs, getBarbersPerformance } from '../queries'
import { KPICard } from '@/components/shared/kpi-card'
import { Skeleton, CardSkeleton, TableSkeleton } from '@/components/shared/loading-skeleton'
import { cn } from '@/lib/utils/cn'
import { WhatsappLogo, Calendar, ChartBar } from '@phosphor-icons/react/dist/ssr'

const RevenueChart = dynamic(() => import('./revenue-chart'), {
  loading: () => <Skeleton className="h-[350px] w-full rounded-3xl" />
})

import { AdminControls } from './admin-controls'

export async function AdminDashboard() {
  const [kpis, barbers] = await Promise.all([
    getAdminKPIs(),
    getBarbersPerformance()
  ])

  return (
    <div className="space-y-12 max-w-[1600px] mx-auto animate-in fade-in duration-700">
      <AdminControls />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Receita do Período"
            value={`R$ ${kpis.revenue.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend={kpis.revenue.trend}
            isPositive={kpis.revenue.isPositive}
            icon={<CurrencyDollar size={24} weight="bold" />}
            subtitle="vs anterior"
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Agendamentos"
            value={kpis.appointments.total}
            icon={<CalendarCheck size={24} weight="bold" />}
            subtitle={`${kpis.appointments.completed} concluídos / ${kpis.appointments.pending} pendentes`}
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Novos Clientes"
            value={kpis.newClients.value}
            trend={kpis.newClients.trend}
            isPositive={kpis.newClients.isPositive}
            icon={<UserPlus size={24} weight="bold" />}
            subtitle="no período"
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Resgates"
            value={kpis.loyaltyRedeemable.value}
            icon={<Ticket size={24} weight="bold" />}
            subtitle="fidelidade pendente"
          />
        </Suspense>
      </div>

      {/* Revenue Chart Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 rounded-[3rem] blur-2xl opacity-50" />
        <div className="relative glass-card p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-syne text-white tracking-tight">Fluxo de Receita</h3>
              <p className="text-text-secondary text-sm">Acompanhamento financeiro detalhado</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                <div className="w-2 h-2 rounded-full bg-accent-cyan shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Realizado</span>
              </div>
            </div>
          </div>
          <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-3xl" />}>
            <RevenueChart />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Performance dos Barbeiros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-10">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-syne text-white flex items-center gap-3 tracking-tight">
                  <Users size={28} weight="bold" className="text-accent-cyan" />
                  Performance da Equipe
                </h3>
                <p className="text-text-secondary text-sm">Ranking de produtividade por receita</p>
              </div>
              <button className="text-xs font-black uppercase tracking-widest text-accent-cyan hover:text-cyan-400 transition-colors bg-accent-cyan/10 px-4 py-2 rounded-xl border border-accent-cyan/20">
                Ver completo
              </button>
            </div>
            
            <Suspense fallback={<TableSkeleton rows={3} />}>
              <div className="space-y-4">
                {barbers.map((barber) => (
                  <div 
                    key={barber.id}
                    className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-5">
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-black group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl"
                        style={{ backgroundColor: barber.color }}
                      >
                        {barber.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white group-hover:text-accent-cyan transition-colors">{barber.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-text-secondary font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                            {barber.rating} ⭐
                          </span>
                          <span className="text-xs text-text-secondary opacity-60">
                            {barber.appointments} agendamentos
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-10">
                      <div className="hidden xl:flex items-center gap-3">
                         <button title="WhatsApp" className="tap-target glass rounded-xl text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 active:scale-90 transition-all">
                            <WhatsappLogo size={20} weight="bold" />
                         </button>
                         <button title="Agenda" className="tap-target glass rounded-xl text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/20 active:scale-90 transition-all">
                            <Calendar size={20} weight="bold" />
                         </button>
                         <button title="Gráficos" className="tap-target glass rounded-xl text-accent-cyan hover:bg-accent-cyan/10 hover:border-accent-cyan/20 active:scale-90 transition-all">
                            <ChartBar size={20} weight="bold" />
                         </button>
                      </div>

                      <div className="text-right min-w-[120px]">
                        <p className="text-xl font-black text-white tracking-tight">R$ {barber.revenue}</p>
                        <div className="w-20 h-1.5 bg-white/10 rounded-full mt-3 ml-auto overflow-hidden shadow-inner">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_currentColor]" 
                            style={{ 
                              width: `${(barber.revenue / 1200) * 100}%`,
                              backgroundColor: barber.color,
                              color: barber.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Suspense>
          </div>
        </div>

        {/* Insights / Notificações */}
        <div className="space-y-6">
          <div className="glass-card p-10 h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold font-syne text-white flex items-center gap-3 tracking-tight">
                <ChartLineUp size={28} weight="bold" className="text-accent-cyan" />
                Feed
              </h3>
              <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
            </div>
            
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-accent-cyan/[0.03] border border-accent-cyan/10 relative overflow-hidden group hover:bg-accent-cyan/[0.06] transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-cyan shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
                <p className="text-sm font-black text-accent-cyan uppercase tracking-widest">Novo Cliente</p>
                <p className="text-sm text-white font-medium mt-1">João Silva <span className="text-text-secondary font-normal">acabou de entrar na plataforma.</span></p>
                <p className="text-[10px] text-text-secondary mt-3 font-bold opacity-50">Agora mesmo</p>
              </div>

              <div className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/10 relative overflow-hidden group hover:bg-red-500/[0.06] transition-all duration-300">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <p className="text-sm font-black text-red-400 uppercase tracking-widest">Cancelamento</p>
                <p className="text-sm text-white font-medium mt-1">Maria Santos <span className="text-text-secondary font-normal">cancelou o horário das 14:00.</span></p>
                <p className="text-[10px] text-text-secondary mt-3 font-bold opacity-50">15 min atrás</p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 opacity-50 hover:opacity-100 transition-all duration-300">
                <p className="text-sm font-black text-white uppercase tracking-widest">Turno Finalizado</p>
                <p className="text-sm text-text-secondary mt-1">Marcos encerrou seu expediente hoje.</p>
                <p className="text-[10px] text-text-secondary mt-3 font-bold opacity-50">2 horas atrás</p>
              </div>
            </div>
            
            <button className="w-full mt-10 py-4 text-xs font-black uppercase tracking-[0.2em] text-text-secondary hover:text-white transition-all border-t border-white/5 group active:scale-95">
              Limpar histórico
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
