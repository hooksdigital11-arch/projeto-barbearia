'use client'

import { WhatsappLogo, GoogleLogo, InstagramLogo, CreditCard, QrCode, Plug } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

export function IntegrationsSettings() {
  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-0.5">
        <h2 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">Integrações</h2>
        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#2a2a2a]">Conecte sua barbearia com o ecossistema digital</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* WhatsApp Integration Card */}
        <div className="bg-[#0a1a0f] border-[0.5px] border-accent-main/15 rounded-[10px] p-5 grid grid-cols-[1fr_140px] gap-4 items-center relative overflow-hidden group">
          {/* Sutil Glow effect */}
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[radial-gradient(circle,_var(--accent-05, #00d4aa08),_transparent)] -mr-10 -mt-10 pointer-events-none" />

          {/* Left Side */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-[#128C7E] flex items-center justify-center text-text-primary shrink-0">
                <WhatsappLogo size={22} weight="fill" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[16px] font-medium text-text-primary tracking-[0.02em] leading-[1.2] uppercase">WhatsApp Business</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-[5px] h-[5px] rounded-full bg-[#c04040]" />
                  <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#c04040]">Desconectado</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#2e2e2e] leading-[1.6] max-w-[340px]">
              Envie lembretes automáticos, confirmações de agendamento e mensagens de boas-vindas diretamente para seus clientes.
            </p>

            <div className="flex items-center gap-4 pt-1">
              <button className="flex items-center gap-2 bg-accent-main text-black px-5 py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] hover:opacity-90 transition-all">
                <Plug size={14} weight="bold" />
                Conectar Agora
              </button>
              <button className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#383838] hover:text-text-nav transition-colors">
                Documentação
              </button>
            </div>
          </div>

          {/* Right Side (QR) */}
          <div className="bg-[#0d1a12] border-[0.5px] border-[#1a2a1a] rounded-[9px] h-[130px] flex flex-col items-center justify-center gap-2.5">
            <QrCode size={36} className="text-[#1e2e1e]" />
            <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#1e3020]">Conecte para ver</span>
          </div>
        </div>

        {/* Future Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          {[
            { 
              name: 'Google Calendar', 
              icon: GoogleLogo, 
              bg: 'bg-[#0d2040]', 
              color: 'text-[#4285f4]' 
            },
            { 
              name: 'Instagram', 
              icon: InstagramLogo, 
              bg: 'bg-[#2e0d1e]', 
              color: 'text-[#e1306c]' 
            },
            { 
              name: 'Stripe', 
              icon: CreditCard, 
              bg: 'bg-[#0d1a2e]', 
              color: 'text-[#6772e5]' 
            },
          ].map((item) => (
            <div key={item.name} className="relative bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[18px_16px] flex flex-col items-center gap-3 opacity-50 group">
              {/* Badge Em Breve */}
              <div className="absolute top-[10px] right-[10px] text-[8px] font-medium uppercase tracking-[0.08em] text-[#2e2e2e] bg-bg-surface border-[0.5px] border-border-main rounded-[4px] px-[7px] py-[2px]">
                Em breve
              </div>

              <div className={cn(
                "w-[42px] h-[42px] rounded-[10px] flex items-center justify-center transition-all",
                item.bg,
                item.color
              )}>
                <item.icon size={22} weight="bold" />
              </div>

              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-nav">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
