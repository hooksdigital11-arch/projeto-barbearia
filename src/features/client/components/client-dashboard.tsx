import { 
  Star, 
  Calendar, 
  ClockCounterClockwise, 
  Ticket,
  Plus,
  Clock,
  ArrowRight,
  CheckCircle,
  Scissors
} from '@phosphor-icons/react/dist/ssr'
import { getClientDashboardData } from '../queries'
import 'server-only'
import { cn } from '@/lib/utils/cn'
import { EmptyState } from '@/components/shared/empty-state'

import { RealtimeRefresher } from '@/components/shared/realtime-refresher'

export async function ClientDashboard() {
  const data = await getClientDashboardData()

  return (
    <div className="p-8 space-y-16 animate-in fade-in duration-1000 pb-20">
      <RealtimeRefresher organizationId="" />
      {/* Header Boas-vindas Pro Max */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-syne text-text-primary tracking-tighter leading-none uppercase">
              Bem-vindo<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-md ml-7 border-l border-white/10 pl-6">
            Olá, <span className="text-text-primary font-bold">{data.profile.name}</span>. Seu barbeiro preferido, <span className="text-accent-cyan font-bold">{data.profile.preferredBarber}</span>, está disponível hoje para transformar seu visual.
          </p>
        </div>
        
        <button className="flex items-center gap-4 px-10 py-7 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-accent-cyan transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-accent-cyan/20 active:scale-95 group lg:ml-0">
          <Plus size={22} weight="bold" className="group-hover:rotate-90 transition-transform duration-500" />
          Agendar Corte
          <ArrowRight size={20} weight="bold" className="group-hover:translate-x-2 transition-transform duration-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cartão de Fidelidade Premium */}
          <div className="p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-card/20 to-accent-cyan/5 backdrop-blur-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <Ticket size={200} weight="duotone" className="text-accent-cyan" />
             </div>

             <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-text-primary font-syne">Cartão Fidelidade</h3>
                    <p className="text-sm text-text-secondary">Complete 10 selos e ganhe um corte grátis!</p>
                  </div>
                  <div className="px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/20 rounded-2xl text-accent-cyan font-bold">
                    {data.profile.loyaltyStamps}/10 Selos
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                        i < data.profile.loyaltyStamps 
                          ? "bg-accent-cyan text-black border-accent-cyan shadow-[0_0_15px_rgba(0,229,255,0.4)] scale-110" 
                          : "bg-white/5 text-text-primary/10 border-white/5"
                      )}
                    >
                      <Scissors size={24} weight={i < data.profile.loyaltyStamps ? "bold" : "thin"} />
                    </div>
                  ))}
                </div>

                {data.profile.loyaltyStamps >= 10 ? (
                  <button className="w-full py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-accent-cyan transition-colors animate-bounce">
                    RESGATAR CORTE GRÁTIS AGORA!
                  </button>
                ) : (
                  <div className="pt-2">
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-accent-cyan transition-all duration-1000 ease-out" 
                        style={{ width: `${(data.profile.loyaltyStamps / 10) * 100}%` }}
                       />
                    </div>
                    <p className="text-[10px] text-text-secondary mt-3 uppercase tracking-widest font-bold">
                      Faltam apenas {10 - data.profile.loyaltyStamps} cortes para seu prêmio
                    </p>
                  </div>
                )}
             </div>
          </div>

          {/* Seção Agendamentos Próximos */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold font-syne text-text-primary flex items-center gap-2">
                  <Calendar size={24} weight="duotone" className="text-accent-cyan" />
                  Seus Agendamentos
                </h3>
             </div>

             {data.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {data.upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-6 rounded-3xl border border-white/5 bg-card/10 hover:bg-white/5 transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="p-4 rounded-2xl bg-accent-cyan/10 text-accent-cyan group-hover:scale-110 transition-transform">
                            <Clock size={32} weight="duotone" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-accent-cyan">{apt.date}</p>
                            <h4 className="text-xl font-bold text-text-primary mt-1">{apt.service}</h4>
                            <p className="text-xs text-text-secondary mt-1">com {apt.barber} • {apt.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <button className="px-6 py-3 bg-white/5 border border-white/10 text-text-primary text-sm font-bold rounded-xl hover:bg-white/10 transition-all">
                              Remarcar
                           </button>
                           <button className="px-6 py-3 bg-red-500/10 text-red-500 text-sm font-bold rounded-xl hover:bg-red-500 hover:text-text-primary transition-all">
                              Cancelar
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <EmptyState 
                  title="Nenhum agendamento ativo" 
                  description="Você ainda não tem nenhum corte marcado para os próximos dias."
                  action={
                    <button className="px-6 py-3 bg-accent-cyan text-black font-bold rounded-xl">
                      Agendar agora
                    </button>
                  }
                />
             )}
          </div>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-8">
          {/* Última Visita / Atalhos */}
          <div className="p-6 rounded-3xl border border-white/5 bg-card/10 space-y-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <ClockCounterClockwise size={24} weight="duotone" className="text-accent-cyan" />
              Histórico & Atalhos
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                <p className="text-xs text-text-secondary uppercase font-bold tracking-tighter">Última Visita</p>
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} weight="fill" className="text-emerald-500" />
                  <span className="text-sm font-medium text-text-primary">Corte + Barba (12 Abr)</span>
                </div>
                <button className="w-full py-3 bg-accent-cyan/10 text-accent-cyan text-xs font-bold rounded-xl hover:bg-accent-cyan hover:text-black transition-all">
                  Repetir este serviço
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                 <p className="text-xs text-text-secondary uppercase font-bold tracking-tighter">Cupons Disponíveis</p>
                 {data.availableCoupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between group/cp cursor-pointer">
                       <div className="flex items-center gap-2">
                          <Ticket size={20} weight="duotone" className="text-yellow-500" />
                          <span className="text-sm font-bold text-text-primary group-hover/cp:text-yellow-500 transition-colors">{coupon.code}</span>
                       </div>
                       <span className="text-xs font-bold text-emerald-500">-{coupon.discount}</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>

          {/* Banner Promocional */}
          <div className="p-8 rounded-3xl bg-accent-cyan text-black relative overflow-hidden group cursor-pointer">
             <div className="relative z-10">
                <h4 className="text-2xl font-black font-syne leading-tight">INDIQUE UM AMIGO</h4>
                <p className="text-sm font-bold mt-2 opacity-80">E ambos ganham 20% de desconto no próximo corte!</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest border-b-2 border-black w-fit pb-1 group-hover:gap-4 transition-all">
                   Pegar meu link <ArrowRight size={16} weight="bold" />
                </div>
             </div>
             <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
                <Star size={120} weight="fill" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
