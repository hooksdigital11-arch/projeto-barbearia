import Link from 'next/link'
import {
  Star,
  Calendar,
  ClockCounterClockwise,
  Ticket,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle,
  Scissors,
  ArrowsClockwise
} from '@phosphor-icons/react/dist/ssr'
import { getClientDashboardData } from '../queries'
import 'server-only'
import { cn } from '@/lib/utils/cn'
import { EmptyState } from '@/components/shared/empty-state'
import { CopyLinkButton } from './copy-link-button'
import { RealtimeRefresher } from '@/components/shared/realtime-refresher'

export async function ClientDashboard() {
  const data = await getClientDashboardData()

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <RealtimeRefresher organizationId="" />
      
      {/* Header Boas-vindas */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-[36px] font-medium text-text-primary tracking-[-0.02em] uppercase leading-none">
            Bem-vindo<span className="text-accent-main">.</span>
          </h1>
          <div className="text-[11px] text-text-muted leading-[1.6] max-w-[400px] uppercase tracking-wide">
            Olá, <span className="text-text-primary font-medium">{data.profile.name}</span>. Seu barbeiro preferido, <span className="text-accent-main font-medium">{data.profile.preferredBarber}</span>, está disponível hoje para transformar seu visual.
          </div>
        </div>
        
        <Link href="/client/appointments" className="flex items-center justify-between gap-6 px-[24px] py-[12px] bg-accent-main text-black font-medium text-[11px] uppercase tracking-[0.08em] rounded-[10px] hover:opacity-90 transition-all shrink-0">
          <div className="flex items-center gap-2">
            <Plus size={14} weight="bold" />
            <span>Agendar Corte</span>
          </div>
          <ArrowRight size={14} weight="bold" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-[18px]">
        {/* Coluna Esquerda */}
        <div className="space-y-[14px]">
          {/* Cartão de Fidelidade */}
          <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-[20px_22px]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[14px] font-medium text-text-secondary uppercase tracking-wider">Cartão Fidelidade</h3>
                <p className="text-[10px] text-text-muted mt-[3px] uppercase tracking-tight">Complete 10 selos e ganhe um corte grátis!</p>
              </div>
              <div className="text-[11px] font-medium text-accent-main uppercase tracking-widest">
                {data.profile.loyaltyStamps}/10 Selos
              </div>
            </div>

            <div className="grid grid-cols-9 gap-[3px] sm:gap-[6px] mt-[16px]">
              {[...Array(9)].map((_, i) => {
                const isFilled = i < data.profile.loyaltyStamps
                return (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-[8px] flex items-center justify-center border transition-all",
                      isFilled
                        ? "bg-[#0d2e1a] border-accent-main/20 text-accent-main"
                        : "bg-bg-surface border-border-main text-text-muted"
                    )}
                  >
                    <Scissors size={14} weight={isFilled ? "fill" : "regular"} />
                  </div>
                )
              })}
            </div>

            <div className="border-t border-surface-secondary mt-[14px] pt-[10px]">
              <p className="text-[9px] text-text-muted uppercase tracking-[0.1em]">
                {data.profile.loyaltyStamps >= 10
                  ? "PRÊMIO DISPONÍVEL! RESGATE SEU CORTE GRÁTIS."
                  : `Faltam ${10 - data.profile.loyaltyStamps} selos para seu próximo prêmio.`}
              </p>
            </div>
          </div>

          {/* Seção Agendamentos */}
          <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-[18px_20px]">
             <div className="flex items-center gap-2 mb-6">
                <Calendar size={15} className="text-text-secondary" weight="bold" />
                <h3 className="text-[13px] font-medium text-text-secondary uppercase tracking-wider">Seus Agendamentos</h3>
             </div>

             {data.upcomingAppointments.length > 0 ? (
                <div className="space-y-[10px]">
                  {data.upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 rounded-[8px] border border-border-main bg-bg-black flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[8px] bg-bg-surface border border-border-main flex items-center justify-center text-accent-main">
                          <Clock size={18} weight="fill" />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-accent-main uppercase tracking-wider">{apt.date} • {apt.time}</p>
                          <h4 className="text-[13px] font-medium text-text-primary tracking-tight">{apt.service}</h4>
                          <p className="text-[10px] text-text-muted uppercase tracking-wider">com {apt.barber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <Link href="/client/appointments" className="px-3 py-1.5 bg-bg-surface border border-border-main text-text-nav text-[10px] font-medium rounded-[6px] hover:text-text-secondary transition-all uppercase">
                            Remarcar
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="min-h-[220px] flex flex-col items-center justify-center py-10 gap-[12px]">
                   <Calendar size={32} className="text-border-main" weight="thin" />
                   <div className="text-center">
                     <p className="text-[14px] font-medium text-text-muted uppercase tracking-wider">Nenhum agendamento ativo</p>
                     <p className="text-[11px] text-text-muted uppercase tracking-widest max-w-[240px] mt-1">Você ainda não tem nenhum corte marcado para os próximos dias.</p>
                   </div>
                   <Link href="/client/appointments" className="text-[10px] text-accent-main uppercase font-medium tracking-[0.06em] mt-2">
                     Agendar agora
                   </Link>
                </div>
             )}
          </div>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-[10px]">
          {/* Histórico & Atalhos */}
          <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-[16px]">
            <div className="flex items-center gap-2 mb-4">
              <ClockCounterClockwise size={14} className="text-text-secondary" weight="bold" />
              <h3 className="text-[12px] font-medium text-text-secondary uppercase tracking-wider">Histórico & Atalhos</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-bg-black border border-border-main rounded-[8px] p-[12px_14px]">
                <p className="text-[8px] text-text-muted font-medium uppercase tracking-[0.12em] mb-[7px]">Última Visita</p>
                <div className="flex items-center gap-3">
                  <div className="w-[8px] h-[8px] rounded-full bg-accent-main" />
                  <span className="text-[11px] font-medium text-text-secondary uppercase tracking-tight truncate">Corte + Barba (12 Abr)</span>
                </div>
                <Link href="/client/services" className="text-[10px] text-accent-main font-medium uppercase tracking-wider mt-[8px]">
                  Repetir este serviço
                </Link>
              </div>

              <div className="bg-bg-black border border-border-main rounded-[8px] p-[12px_14px] space-y-3">
                 <p className="text-[9px] text-text-muted font-medium uppercase tracking-[0.1em]">Cupons Disponíveis</p>
                 {data.availableCoupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Ticket size={14} weight="fill" className="text-text-muted" />
                          <span className="text-[11px] font-medium text-text-secondary">{coupon.code}</span>
                       </div>
                       <span className="text-[10px] font-medium text-accent-main">-{coupon.discount}</span>
                    </div>
                 ))}
                 {data.availableCoupons.length === 0 && (
                   <p className="text-[9px] text-text-muted uppercase tracking-widest">Nenhum cupom</p>
                 )}
              </div>
            </div>
          </div>

          {/* Indique um Amigo */}
          <div className="bg-bg-sidebar border border-border-main rounded-[10px] p-[16px]">
             <h4 className="text-[16px] font-medium text-text-primary leading-[1.2] tracking-[-0.01em] uppercase mb-[10px]">Indique um Amigo</h4>
             <p className="text-[10px] text-text-muted leading-[1.4] uppercase tracking-tight mb-[14px]">E ambos ganham 20% de desconto no próximo corte!</p>
             <div className="space-y-2">
               <div className="bg-bg-black border border-border-main rounded-[7px] p-[10px_13px] text-text-secondary text-[12px] truncate">
                 barber.saas/ref/davi
               </div>
               <CopyLinkButton url="barber.saas/ref/davi" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
