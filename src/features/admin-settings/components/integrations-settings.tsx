'use client'

import { WhatsappLogo, GoogleLogo, InstagramLogo, CreditCard, QrCode, CheckCircle, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export function IntegrationsSettings() {
  return (
    <div className="space-y-16">
      <div>
        <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter">Integrações</h2>
        <p className="label-muted mt-2">Conecte sua barbearia com o ecossistema digital</p>
      </div>

      <div className="grid gap-8">
        {/* WhatsApp Integration */}
        <div className="p-10 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 flex flex-col md:flex-row gap-10">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-black border border-emerald-500/20 flex items-center justify-center text-emerald-500 transition-all">
                <WhatsappLogo size={32} weight="bold" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">WhatsApp Business</h3>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 opacity-40" />
                  <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">Desconectado</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm font-medium text-text-muted leading-relaxed max-w-lg">
              Envie lembretes automáticos, confirmações de agendamento e mensagens de boas-vindas diretamente para seus clientes pelo WhatsApp.
            </p>

            <div className="pt-6 flex items-center gap-6">
              <button className="px-10 py-3.5 rounded-full bg-emerald-500 text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all">
                Conectar Agora
              </button>
              <button className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted hover:text-white transition-colors">
                Documentação
              </button>
            </div>
          </div>

          <div className="w-full md:w-56 aspect-square rounded-3xl bg-white flex flex-col items-center justify-center p-8 gap-4 opacity-10">
            <QrCode size={100} className="text-black" />
            <p className="text-[10px] text-black font-black uppercase tracking-widest">Conecte para ver</p>
          </div>
        </div>

        {/* Placeholders for future integrations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Google Calendar', icon: GoogleLogo, color: 'text-white/20' },
            { name: 'Instagram', icon: InstagramLogo, color: 'text-white/20' },
            { name: 'Stripe Payments', icon: CreditCard, color: 'text-white/20' },
          ].map((item) => (
            <div key={item.name} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.06] flex flex-col items-center text-center gap-6 opacity-40">
              <div className="w-16 h-16 rounded-full border border-white/[0.06] flex items-center justify-center text-white/20">
                <item.icon size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white uppercase tracking-tight leading-none">{item.name}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">Em breve</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
