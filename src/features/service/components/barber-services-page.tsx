import { Scissors, Clock } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'
import type { Service } from '../types'

interface BarberServicesPageProps {
  services: Service[]
}

export function BarberServicesPage({ services }: BarberServicesPageProps) {
  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category || 'outros'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[28px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">
          Serviços Disponíveis
        </h1>
        <p className="text-[11px] text-[#333] mt-[5px] uppercase tracking-wider">
          Consulte o cardápio completo de serviços e valores atualizados.
        </p>
      </div>

      {/* Pills de resumo */}
      <div className="flex items-center gap-[8px] mb-[24px]">
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[7px] p-[6px_14px] flex items-center gap-[7px]">
          <Scissors size={13} className="text-[#444]" weight="bold" />
          <span className="text-[13px] font-medium text-[#fff]">{services.length}</span>
          <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em]">Serviços</span>
        </div>
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[7px] p-[6px_14px] flex items-center gap-[7px]">
          <span className="text-[13px] font-medium text-[#fff]">{Object.keys(grouped).length}</span>
          <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em]">Categorias</span>
        </div>
      </div>

      {/* Services by Category */}
      {Object.entries(grouped).map(([category, items]) => {
        const catKey = category.toUpperCase()
        const colors: Record<string, string> = {
          BARBA: '#d4aa00',
          COMBO: 'var(--accent)',
          CORTE: '#6b9fff',
          OUTROS: '#9b7cf6'
        }
        const bgColors: Record<string, string> = {
          BARBA: '#2e1a00',
          COMBO: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          CORTE: '#0d1a2e',
          OUTROS: '#1a0d2e'
        }
        const color = colors[catKey] || colors.OUTROS
        const bgColor = bgColors[catKey] || bgColors.OUTROS
        
        const isOutrosWithTwo = catKey === 'OUTROS' && items.length === 2

        return (
          <div key={category} className="space-y-5 mb-[20px]">
            <div className="flex items-center">
              <div className="w-[3px] h-[16px] rounded-[2px]" style={{ backgroundColor: color }} />
              <h2 className="text-[12px] font-medium text-[#bbb] uppercase tracking-[0.1em] ml-3">{category}</h2>
              <span className="text-[9px] font-medium text-[#444] bg-[#1a1a1a] rounded-[4px] p-[2px_8px] ml-[8px] uppercase tracking-wider">
                {items.length}
              </span>
            </div>

            <div className={cn(
              "grid gap-x-[10px] gap-y-[6px]",
              isOutrosWithTwo ? "grid-cols-2" : "grid-cols-1"
            )}>
              {items.map(service => (
                <div
                  key={service.id}
                  className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[9px] p-[14px_16px] flex items-start gap-[14px] group hover:bg-[#111] hover:border-[#222] transition-all"
                >
                  <div
                    className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Scissors size={16} weight="fill" className="text-[#fff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#ccc] leading-tight uppercase tracking-tight">{service.name}</p>
                    {service.description && (
                      <p className="text-[10px] text-[#2e2e2e] mt-[2px] mb-[8px] leading-tight uppercase tracking-tight">{service.description}</p>
                    )}
                    <div className="flex items-center">
                      <div className="flex items-center gap-[4px] mr-[14px]">
                        <Clock size={11} className="text-[#2a2a2a]" weight="bold" />
                        <span className="text-[10px] text-[#444] uppercase tracking-[0.04em]">{service.duration_minutes}min</span>
                      </div>
                      <div className="flex items-baseline gap-[2px]">
                        <span className="text-[10px] text-[#555] font-medium uppercase">R$</span>
                        <span className="text-[14px] font-medium text-[#fff] tracking-tight">
                          {(service.price_cents / 100).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {services.length === 0 && (
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-32 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-[#141414] flex items-center justify-center text-[#2a2a2a]">
            <Scissors size={48} weight="thin" />
          </div>
          <p className="text-[14px] font-medium text-[#333] uppercase tracking-widest">Nenhum serviço cadastrado</p>
        </div>
      )}
    </div>
  )
}
