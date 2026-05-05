'use client'

import { useState, useTransition } from 'react'
import { Plus, PencilSimple, Trash, Copy, Scissors, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { deleteService, createService, updateService } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Service } from '../types'

export function ServicesSettings({ initialData }: { initialData: Service[] }) {
  const [services, setServices] = useState(initialData)
  const [isPending, startTransition] = useTransition()
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este serviço?')) return
    
    startTransition(async () => {
      const result = await deleteService(id)
      if (result.success) {
        setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s))
        toast.success('Serviço desativado!')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-syne text-white">Serviços Oferecidos</h2>
          <p className="text-muted-foreground">Gerencie o cardápio de serviços da sua barbearia</p>
        </div>
        <Button className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 rounded-2xl px-6">
          <Plus size={18} weight="bold" />
          Novo Serviço
        </Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Serviço</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Duração</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Preço</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                      <Scissors size={20} weight="duotone" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{service.name}</p>
                      <p className="text-xs text-muted-foreground">{service.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-muted-foreground">
                  {service.duration} min
                </td>
                <td className="px-6 py-5">
                  <span className="font-mono text-sm text-accent-cyan">{formatPrice(service.price_cents)}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      service.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500/50"
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {service.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5">
                      <Copy size={18} />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5">
                      <PencilSimple size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="p-20 text-center text-muted-foreground">
            Nenhum serviço cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
