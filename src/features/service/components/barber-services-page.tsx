import { Scissors, Clock, CurrencyDollar } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils/cn'
import { CATEGORY_CONFIG } from '../types'
import type { Service, ServiceCategory } from '../types'

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

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-accent-cyan rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
          <h1 className="text-4xl font-black font-syne text-white tracking-tighter uppercase leading-none">
            Serviços <span className="text-accent-cyan">Disponíveis</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg font-medium">
          Consulte o cardápio completo de serviços e valores atualizados.
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6">
        <div className="glass px-5 py-2.5 rounded-2xl border border-white/5 flex items-center gap-2">
          <Scissors size={18} weight="bold" className="text-accent-cyan" />
          <span className="text-sm font-bold text-white">{services.length}</span>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">serviços</span>
        </div>
        <div className="glass px-5 py-2.5 rounded-2xl border border-white/5 flex items-center gap-2">
          <span className="text-sm font-bold text-white">{Object.keys(grouped).length}</span>
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">categorias</span>
        </div>
      </div>

      {/* Services by Category */}
      {Object.entries(grouped).map(([category, items]) => {
        const config = CATEGORY_CONFIG[category as ServiceCategory] || CATEGORY_CONFIG.outros
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: config.color, boxShadow: `0 0 12px ${config.color}60` }} />
              <h2 className="text-xl font-bold font-syne text-white uppercase tracking-tight">{config.label}</h2>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {items.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(service => (
                <div
                  key={service.id}
                  className="glass-card p-6 flex items-start gap-5 group hover:scale-[1.01] transition-all duration-500"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border group-hover:scale-110 transition-transform duration-500"
                    style={{ backgroundColor: `${config.color}15`, borderColor: `${config.color}30` }}
                  >
                    <Scissors size={24} weight="duotone" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-white group-hover:text-accent-cyan transition-colors leading-tight">{service.name}</p>
                    {service.description && (
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 opacity-60">{service.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Clock size={14} weight="bold" />
                        <span className="text-xs font-bold">{service.duration_minutes}min</span>
                      </div>
                      <span className="text-base font-black text-accent-cyan font-mono tracking-tight">
                        {formatPrice(service.price_cents)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {services.length === 0 && (
        <div className="glass-card p-32 text-center flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-text-secondary opacity-20">
            <Scissors size={48} weight="thin" />
          </div>
          <p className="text-xl font-bold font-syne text-white uppercase tracking-tight">Nenhum serviço cadastrado</p>
          <p className="text-text-secondary">O administrador ainda não cadastrou serviços.</p>
        </div>
      )}
    </div>
  )
}
