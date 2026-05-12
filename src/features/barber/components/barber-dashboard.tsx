'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Clock, 
  CheckCircle, 
  User, 
  ArrowRight,
  ListNumbers,
  ChartBar,
  Phone,
  UserMinus,
  Coffee,
  SignOut
} from '@phosphor-icons/react'
import { ServiceTimer } from './service-timer'
import { QuickNotes } from './quick-notes'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

import { useDashboardRealtime } from '@/features/analytics/useDashboardRealtime'

export function BarberDashboard({ initialData, organizationId }: { initialData: any, organizationId: string }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)

  // Sincronização Realtime Global
  useDashboardRealtime(organizationId)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  return (
    <div className="p-8 space-y-16 animate-in fade-in duration-1000">
      {/* Header com Design Assimétrico Pro Max */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-accent-cyan rounded-full shadow-[0_0_30px_rgba(0,229,255,0.4)]" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-syne text-text-primary tracking-tighter leading-none uppercase">
              Workspace<span className="text-accent-cyan">.</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium max-w-md ml-7 border-l border-white/10 pl-6">
            Centro de controle do barbeiro. Monitore sua agenda, atenda clientes e gerencie seu desempenho em tempo real.
          </p>
        </div>
      </div>

      {/* Header / Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse" />
          <div>
            <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Status Operacional</p>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">{data.status}</h2>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-full text-accent-cyan transition-colors">
                <Clock size={18} weight="bold" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-8">
          <div className="flex items-center gap-3">
            <Clock size={24} weight="duotone" className="text-accent-cyan" />
            <div>
              <p className="text-xs text-text-secondary">Turno de Hoje</p>
              <p className="text-sm font-bold text-text-primary">{data.shift}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ChartBar size={24} weight="duotone" className="text-accent-cyan" />
            <div>
              <p className="text-xs text-text-secondary">Receita Dia</p>
              <p className="text-sm font-bold text-text-primary">R$ {data.stats.revenueDay}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-text-secondary hover:text-text-primary transition-all" title="Pausa Café">
            <Coffee size={20} weight="duotone" />
          </button>
          <button className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all active:scale-95">
            Finalizar Turno
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Central: Agenda e Cliente Atual */}
        <div className="lg:col-span-2 space-y-8">
          {/* Cliente Atual (Destaque) */}
          {data.currentClient ? (
            <div className="p-8 rounded-3xl border border-accent-cyan/20 bg-accent-cyan/5 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <User size={160} weight="duotone" className="text-accent-cyan" />
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-[10px] font-bold rounded-full uppercase tracking-tighter">
                    Atendimento Ativo
                  </span>
                  <ServiceTimer initialMinutes={Math.floor(data.currentClient.elapsedMinutes || 0)} targetMinutes={45} />
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-accent-cyan/20 flex items-center justify-center text-3xl font-bold text-accent-cyan">
                    {data.currentClient.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-text-primary font-syne tracking-tight">{data.currentClient.name}</h3>
                    <p className="text-text-secondary font-medium">{data.currentClient.todayService}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-text-primary transition-all">
                        <Phone size={20} weight="duotone" />
                    </button>
                    <button className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-text-primary transition-all" title="No-show">
                        <UserMinus size={20} weight="duotone" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-y border-white/5 py-8">
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Frequência</p>
                    <p className="text-xl font-bold text-text-primary mt-1">{data.currentClient.visits} visitas</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Avaliação</p>
                    <p className="text-xl font-bold text-text-primary mt-1">{data.currentClient.rating} ⭐</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-text-secondary uppercase font-bold tracking-widest">Total Gasto</p>
                    <p className="text-xl font-bold text-accent-cyan mt-1">R$ {data.currentClient.totalSpent}</p>
                  </div>
                </div>

                {/* Notas Rápidas */}
                <QuickNotes initialNote={data.currentClient.lastNote} />

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="flex-1 min-w-[150px] py-4 bg-accent-cyan text-black font-extrabold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-accent-cyan/20">
                    Finalizar e Próximo
                  </button>
                  <button className="px-6 py-4 bg-white/5 border border-white/10 text-text-primary font-bold rounded-2xl hover:bg-white/10 transition-all">
                    Comanda Digital
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-text-secondary">
                <User size={40} weight="duotone" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-text-primary">Nenhum atendimento ativo</h3>
                <p className="text-sm text-text-secondary">Chame o próximo cliente da fila ou agenda para começar.</p>
              </div>
            </div>
          )}

          {/* Timeline do Dia */}
          <div className="p-6 rounded-3xl border border-white/5 bg-card/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-bold font-syne text-text-primary">Agenda do Período</h3>
               <button className="text-xs font-bold text-text-secondary hover:text-text-primary">Ver calendário completo</button>
            </div>
            <div className="space-y-4">
              {data.appointments.map((apt: any) => (
                <div 
                  key={apt.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all border",
                    apt.status === 'in_progress' ? "bg-accent-cyan/5 border-accent-cyan/20" : "bg-white/5 border-transparent hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 font-mono text-sm text-text-secondary text-center">{apt.time}</div>
                    <div className="w-1 h-8 rounded-full bg-white/5" />
                    <div>
                      <p className="font-bold text-text-primary">{apt.client}</p>
                      <p className="text-xs text-text-secondary">{apt.service} • {apt.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {apt.status === 'completed' ? <CheckCircle size={24} weight="duotone" className="text-emerald-500" /> : null}
                    {apt.status === 'in_progress' ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-accent-cyan/10 text-accent-cyan rounded-lg text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                        Em Atendimento
                      </div>
                    ) : null}
                    {apt.status === 'next' ? (
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">PRÓXIMO</span>
                         <button className="p-2 hover:bg-white/5 rounded-lg transition-all"><ArrowRight size={18} /></button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Lateral: Fila de Espera */}
        <div className="space-y-8">
          <div className="p-6 rounded-3xl border border-white/5 bg-card/10 backdrop-blur-xl h-fit">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-syne text-text-primary flex items-center gap-2">
                <ListNumbers size={24} weight="duotone" className="text-accent-cyan" />
                Fila de Espera
              </h3>
              <span className="text-xs font-bold text-accent-cyan bg-accent-cyan/10 px-2 py-0.5 rounded-full">
                {data.waitingList.length} total
              </span>
            </div>

            <div className="space-y-4">
              {data.waitingList.map((client: any, index: number) => (
                <div key={client.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-accent-cyan/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-white/5 group-hover:bg-accent-cyan/50 transition-colors" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold text-text-secondary group-hover:bg-accent-cyan/20 group-hover:text-accent-cyan transition-colors">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary group-hover:text-accent-cyan transition-colors">{client.name}</p>
                        <p className="text-xs text-text-secondary">{client.service}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                       <span className="text-[10px] text-text-secondary uppercase">Aguardando há</span>
                       <span className="text-sm font-bold text-accent-cyan">{client.waitingTime}</span>
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-accent-cyan text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all">
                      Chamar agora
                    </button>
                  </div>
                </div>
              ))}

              {data.waitingList.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-sm text-text-secondary">Ninguém na fila.</p>
                </div>
              )}
            </div>
            
            <button className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-text-primary font-bold rounded-2xl hover:bg-white/10 transition-all text-xs">
               Adicionar Cliente Manualmente
            </button>
          </div>

          {/* Dica Operacional */}
          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20">
             <div className="flex items-center gap-3 text-blue-400 mb-3">
                <SignOut size={20} weight="duotone" />
                <span className="text-sm font-bold uppercase tracking-wider">Aviso</span>
             </div>
             <p className="text-xs text-text-secondary leading-relaxed">
                Lembre-se de sincronizar sua comanda digital a cada atendimento para garantir o fechamento correto do dia.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
