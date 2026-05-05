'use client'

import { WhatsappLogo, GoogleLogo, InstagramLogo, CreditCard, QrCode, CheckCircle, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export function IntegrationsSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-syne text-white">Integrações</h2>
        <p className="text-muted-foreground">Conecte sua barbearia com outras ferramentas</p>
      </div>

      <div className="grid gap-6">
        {/* WhatsApp Integration */}
        <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <WhatsappLogo size={28} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">WhatsApp Business</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                  <span className="text-xs text-muted-foreground font-medium">Desconectado</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Envie lembretes automáticos, confirmações de agendamento e mensagens de boas-vindas diretamente para seus clientes pelo WhatsApp.
            </p>

            <div className="pt-4 flex items-center gap-3">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold gap-2 px-6 rounded-xl">
                Conectar Agora
              </Button>
              <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">
                Saiba Mais
              </Button>
            </div>
          </div>

          <div className="w-full md:w-48 aspect-square rounded-3xl bg-white flex flex-col items-center justify-center p-6 gap-2 opacity-50 grayscale">
            <QrCode size={80} className="text-black" />
            <p className="text-[10px] text-black font-bold uppercase tracking-widest">Conecte para ver</p>
          </div>
        </div>

        {/* Placeholders for future integrations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Google Calendar', icon: GoogleLogo, color: 'text-blue-400' },
            { name: 'Instagram', icon: InstagramLogo, color: 'text-pink-400' },
            { name: 'Stripe Payments', icon: CreditCard, color: 'text-purple-400' },
          ].map((item) => (
            <div key={item.name} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 flex flex-col items-center text-center gap-4 opacity-50 cursor-not-allowed group hover:bg-white/[0.07] transition-all">
              <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center transition-all group-hover:scale-110", item.color)}>
                <item.icon size={28} weight="duotone" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{item.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Em breve</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
