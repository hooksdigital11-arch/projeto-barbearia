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

import { RealtimeRefresher } from '@/components/shared/realtime-refresher'

export async function ClientDashboard() {
  const data = await getClientDashboardData()

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      <RealtimeRefresher organizationId="" />
      
      {/* Header Boas-vindas */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-[36px] font-medium text-[#fff] tracking-[-0.02em] uppercase leading-none">
            Bem-vindo<span className="text-[#00d4aa]">.</span>
          </h1>
          <div className="text-[11px] text-[#333] leading-[1.6] max-w-[400px] uppercase tracking-wide">
            Olá, <span className="text-[#fff] font-medium">{data.profile.name}</span>. Seu barbeiro preferido, <span className="text-[#00d4aa] font-medium">{data.profile.preferredBarber}</span>, está disponível hoje para transformar seu visual.
          </div>
        </div>
        
        <button className="flex items-center justify-between gap-6 px-[24px] py-[12px] bg-[#fff] text-[#000] font-medium text-[11px] uppercase tracking-[0.08em] rounded-[10px] hover:bg-[#e8e8e8] transition-all shrink-0">
          <div className="flex items-center gap-2">
            <Plus size={14} weight="bold" />
            <span>Agendar Corte</span>
          </div>
          <ArrowRight size={14} weight="bold" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-[18px]">
        {/* Coluna Esquerda */}
        <div className="space-y-[14px]">
          {/* Cartão de Fidelidade */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[20px_22px]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[14px] font-medium text-[#ccc] uppercase tracking-wider">Cartão Fidelidade</h3>
                <p className="text-[10px] text-[#2e2e2e] mt-[3px] uppercase tracking-tight">Complete 10 selos e ganhe um corte grátis!</p>
              </div>
              <div className="text-[11px] font-medium text-[#00d4aa] uppercase tracking-widest">
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
                        ? "bg-[#0d2e1a] border-[#00d4aa33] text-[#00d4aa]"
                        : "bg-[#141414] border-[#1e1e1e] text-[#2a2a2a]"
                    )}
                  >
                    <Scissors size={14} weight={isFilled ? "fill" : "regular"} />
                  </div>
                )
              })}
            </div>

            <div className="border-t border-[#161616] mt-[14px] pt-[10px]">
              <p className="text-[9px] text-[#2a2a2a] uppercase tracking-[0.1em]">
                {data.profile.loyaltyStamps >= 10 
                  ? "PRÊMIO DISPONÍVEL! RESGATE SEU CORTE GRÁTIS." 
                  : `Faltam ${10 - data.profile.loyaltyStamps} selos para seu próximo prêmio.`}
              </p>
            </div>
          </div>

          {/* Seção Agendamentos */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[18px_20px]">
             <div className="flex items-center gap-2 mb-6">
                <Calendar size={15} className="text-[#444]" weight="bold" />
                <h3 className="text-[13px] font-medium text-[#bbb] uppercase tracking-wider">Seus Agendamentos</h3>
             </div>

             {data.upcomingAppointments.length > 0 ? (
                <div className="space-y-[10px]">
                  {data.upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 rounded-[8px] border border-[#1a1a1a] bg-[#0d0d0d] flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[8px] bg-[#141414] border border-[#1e1e1e] flex items-center justify-center text-[#00d4aa]">
                          <Clock size={18} weight="fill" />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-[#00d4aa] uppercase tracking-wider">{apt.date} • {apt.time}</p>
                          <h4 className="text-[13px] font-medium text-[#fff] tracking-tight">{apt.service}</h4>
                          <p className="text-[10px] text-[#333] uppercase tracking-wider">com {apt.barber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="px-3 py-1.5 bg-[#141414] border border-[#1e1e1e] text-[#555] text-[10px] font-medium rounded-[6px] hover:text-[#bbb] transition-all uppercase">
                            Remarcar
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="min-h-[220px] flex flex-col items-center justify-center py-10 gap-[12px]">
                   <Calendar size={32} className="text-[#1e1e1e]" weight="thin" />
                   <div className="text-center">
                     <p className="text-[14px] font-medium text-[#333] uppercase tracking-wider">Nenhum agendamento ativo</p>
                     <p className="text-[11px] text-[#222] uppercase tracking-widest max-w-[240px] mt-1">Você ainda não tem nenhum corte marcado para os próximos dias.</p>
                   </div>
                   <button className="text-[10px] text-[#00d4aa] uppercase font-medium tracking-[0.06em] mt-2">
                     Agendar agora
                   </button>
                </div>
             )}
          </div>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-[10px]">
          {/* Histórico & Atalhos */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[16px]">
            <div className="flex items-center gap-2 mb-4">
              <ClockCounterClockwise size={14} className="text-[#444]" weight="bold" />
              <h3 className="text-[12px] font-medium text-[#bbb] uppercase tracking-wider">Histórico & Atalhos</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[8px] p-[12px_14px]">
                <p className="text-[8px] text-[#2a2a2a] font-medium uppercase tracking-[0.12em] mb-[7px]">Última Visita</p>
                <div className="flex items-center gap-3">
                  <div className="w-[8px] h-[8px] rounded-full bg-[#00d4aa]" />
                  <span className="text-[11px] font-medium text-[#bbb] uppercase tracking-tight truncate">Corte + Barba (12 Abr)</span>
                </div>
                <button className="text-[10px] text-[#00d4aa] font-medium uppercase tracking-wider mt-[8px]">
                  Repetir este serviço
                </button>
              </div>

              <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[8px] p-[12px_14px] space-y-3">
                 <p className="text-[9px] text-[#2a2a2a] font-medium uppercase tracking-[0.1em]">Cupons Disponíveis</p>
                 {data.availableCoupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Ticket size={14} weight="fill" className="text-[#333]" />
                          <span className="text-[11px] font-medium text-[#bbb]">{coupon.code}</span>
                       </div>
                       <span className="text-[10px] font-medium text-[#00d4aa]">-{coupon.discount}</span>
                    </div>
                 ))}
                 {data.availableCoupons.length === 0 && (
                   <p className="text-[9px] text-[#222] uppercase tracking-widest">Nenhum cupom</p>
                 )}
              </div>
            </div>
          </div>

          {/* Indique um Amigo */}
          <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[16px]">
             <h4 className="text-[16px] font-medium text-[#fff] leading-[1.2] tracking-[-0.01em] uppercase mb-[10px]">Indique um Amigo</h4>
             <p className="text-[10px] text-[#2e2e2e] leading-[1.4] uppercase tracking-tight mb-[14px]">E ambos ganham 20% de desconto no próximo corte!</p>
             <div className="space-y-2">
               <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-[7px] p-[10px_13px] text-[#bbb] text-[12px] truncate">
                 barber.saas/ref/davi
               </div>
               <button className="w-full py-2.5 bg-[#1a1a1a] text-[#bbb] text-[10px] font-medium uppercase tracking-wider rounded-[6px] hover:bg-[#222] transition-all">
                 Copiar Link
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
