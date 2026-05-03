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
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <AdminControls />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Receita do Período"
            value={`R$ ${kpis.revenue.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            trend={kpis.revenue.trend}
            isPositive={kpis.revenue.isPositive}
            icon={<CurrencyDollar size={24} weight="duotone" />}
            subtitle="vs anterior"
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Agendamentos"
            value={kpis.appointments.total}
            icon={<CalendarCheck size={24} weight="duotone" />}
            subtitle={`${kpis.appointments.completed} concluídos / ${kpis.appointments.pending} pendentes`}
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Novos Clientes"
            value={kpis.newClients.value}
            trend={kpis.newClients.trend}
            isPositive={kpis.newClients.isPositive}
            icon={<UserPlus size={24} weight="duotone" />}
            subtitle="no período"
          />
        </Suspense>
        <Suspense fallback={<CardSkeleton />}>
          <KPICard
            title="Resgates"
            value={kpis.loyaltyRedeemable.value}
            icon={<Ticket size={24} weight="duotone" />}
            subtitle="fidelidade pendente"
          />
        </Suspense>
      </div>

      {/* Revenue Chart Section */}
      <div className="w-full">
        <Suspense fallback={<Skeleton className="h-[350px] w-full rounded-3xl" />}>
          <RevenueChart />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance dos Barbeiros */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl border border-white/5 bg-card/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-syne text-white flex items-center gap-2">
                <Users size={24} weight="duotone" className="text-accent-cyan" />
                Performance da Equipe
              </h3>
              <button className="text-xs font-bold text-accent-cyan hover:underline">Ver ranking completo</button>
            </div>
            
            <Suspense fallback={<TableSkeleton rows={3} />}>
              <div className="space-y-4">
                {barbers.map((barber) => (
                  <div 
                    key={barber.id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: barber.color }}
                      >
                        {barber.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-accent-cyan transition-colors">{barber.name}</p>
                        <p className="text-xs text-text-secondary">{barber.rating} ⭐ • {barber.appointments} agendamentos</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex flex-wrap gap-2">
                         <button title="WhatsApp" className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                            <WhatsappLogo size={18} weight="duotone" />
                         </button>
                         <button title="Agenda" className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                            <Calendar size={18} weight="duotone" />
                         </button>
                         <button title="Gráficos" className="p-2 rounded-lg bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan hover:text-black transition-all">
                            <ChartBar size={18} weight="duotone" />
                         </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-white">R$ {barber.revenue}</p>
                        <div className="w-16 h-1 bg-white/10 rounded-full mt-2 ml-auto overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-1000" 
                            style={{ 
                              width: `${(barber.revenue / 1200) * 100}%`,
                              backgroundColor: barber.color 
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
          <div className="p-6 rounded-3xl border border-white/5 bg-card/10 backdrop-blur-xl">
            <h3 className="text-xl font-bold font-syne text-white mb-6 flex items-center gap-2">
              <ChartLineUp size={24} weight="duotone" className="text-accent-cyan" />
              Notificações
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-accent-cyan/5 border border-accent-cyan/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-full bg-accent-cyan/20" />
                <p className="text-sm font-bold text-accent-cyan">Novo Cliente!</p>
                <p className="text-xs text-text-secondary mt-1">João Silva acabou de se cadastrar na sua barbearia.</p>
                <p className="text-[10px] text-text-secondary mt-2 uppercase">Agora mesmo</p>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
                <p className="text-sm font-bold text-red-400">Cancelamento</p>
                <p className="text-xs text-text-secondary mt-1">Maria Santos cancelou o corte com Rafael (14:00).</p>
                <p className="text-[10px] text-text-secondary mt-2 uppercase">15 minutos atrás</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                <p className="text-sm font-bold text-white">Turno Finalizado</p>
                <p className="text-xs text-text-secondary mt-1">Marcos encerrou seu expediente do dia.</p>
                <p className="text-[10px] text-text-secondary mt-2 uppercase">2 horas atrás</p>
              </div>
            </div>
            
            <button className="w-full mt-6 py-3 text-xs font-bold text-text-secondary hover:text-white transition-colors border-t border-white/5 pt-6">
              Limpar todas as notificações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
