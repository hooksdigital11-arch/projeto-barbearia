'use client'

import { useState, useTransition } from 'react'
import { Plus, PencilSimple, Trash, Copy, Scissors, CircleNotch, Play, Pause, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { deleteService, createService, updateService, toggleServiceStatus } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import type { Service } from '../types'

export function ServicesSettings({ initialData }: { initialData: Service[] }) {
  const [services, setServices] = useState(initialData)
  const [isPending, startTransition] = useTransition()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null)
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) return
    
    startTransition(async () => {
      const result = await deleteService(id)
      if (result.success) {
        setServices(prev => prev.filter(s => s.id !== id))
        toast.success('Serviço excluído!')
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleToggleActive = (service: Service) => {
    const newStatus = !service.is_active
    // Optimistic update
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s))
    
    startTransition(async () => {
      const result = await toggleServiceStatus(service.id, newStatus)
      if (!result.success) {
        toast.error(result.error)
        // Revert
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !newStatus } : s))
      } else {
        toast.success(newStatus ? 'Serviço ativado!' : 'Serviço pausado!')
      }
    })
  }

  const handleDuplicate = (service: Service) => {
    setEditingService({ 
      ...service, 
      id: undefined, 
      name: `${service.name} (Cópia)` 
    })
    setIsModalOpen(true)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsModalOpen(true)
  }

  const handleNew = () => {
    setEditingService(null)
    setIsModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const input = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      duration: parseInt(formData.get('duration') as string, 10),
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as any,
      isActive: editingService?.is_active ?? true,
    }

    startTransition(async () => {
      let result;
      if (editingService?.id) {
        result = await updateService(editingService.id, input)
      } else {
        result = await createService(input)
      }

      if (result.success) {
        toast.success(editingService?.id ? 'Serviço atualizado!' : 'Serviço criado!')
        setIsModalOpen(false)
        // O revalidateTag do Next.js atualizará a página, mas para UI otimista recarregamos
        window.location.reload() 
      } else {
        toast.error(result.error || 'Erro ao salvar serviço')
      }
    })
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-l-2 border-accent-cyan pl-8 py-2">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black font-syne text-white uppercase tracking-tighter leading-none">Serviços</h2>
          <p className="label-muted">Gerencie o cardápio de experiências e valores do seu negócio</p>
        </div>
        <button 
          onClick={handleNew} 
          className="px-10 py-4 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shrink-0 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
        >
          <Plus size={18} weight="bold" />
          Novo Serviço
        </button>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Serviço</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Duração</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Investimento</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group/row">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-black border border-white/[0.08] flex items-center justify-center text-white/20 group-hover/row:text-accent-cyan group-hover/row:border-accent-cyan/40 transition-all">
                          <Scissors size={24} />
                        </div>
                        <div className="space-y-1.5">
                          <p className="font-bold text-white text-lg tracking-tight leading-none group-hover/row:text-accent-cyan transition-colors">{service.name}</p>
                          <p className="text-[9px] text-text-muted uppercase font-black tracking-[0.2em] font-syne">{service.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-sm font-bold text-white font-mono tracking-tight">
                        {service.duration_minutes} MIN
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <span className="font-mono text-lg font-black text-accent-cyan tracking-tighter">
                        {formatPrice(service.price_cents)}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all shadow-[0_0_8px_rgba(0,0,0,0)]",
                          service.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-white/10"
                        )} />
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-[0.2em] font-mono",
                          service.is_active ? "text-emerald-500" : "text-text-muted"
                        )}>
                          {service.is_active ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all translate-x-2 group-hover/row:translate-x-0">
                        <button 
                          onClick={() => handleToggleActive(service)}
                          title={service.is_active ? 'Pausar' : 'Ativar'}
                          className={cn(
                            "w-11 h-11 flex items-center justify-center rounded-full border border-white/5 transition-all hover:bg-white/5",
                            service.is_active ? "text-emerald-500 hover:border-emerald-500/40" : "text-text-muted hover:text-white hover:border-white/40"
                          )} 
                        >
                          {service.is_active ? <Pause size={18} weight="bold" /> : <Play size={18} weight="bold" />}
                        </button>
                        <button 
                          onClick={() => handleEdit(service)} 
                          title="Editar"
                          className="w-11 h-11 flex items-center justify-center rounded-full border border-white/5 text-text-muted hover:text-white hover:border-white/40 hover:bg-white/5 transition-all"
                        >
                          <PencilSimple size={18} weight="bold" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          title="Remover"
                          className="w-11 h-11 flex items-center justify-center rounded-full border border-white/5 text-text-muted hover:text-red-400 hover:border-red-400/40 hover:bg-red-400/5 transition-all"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
        {services.length === 0 && (
          <div className="p-40 text-center flex flex-col items-center gap-10">
            <div className="w-1.5 h-12 bg-white/5" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Nenhum serviço disponível</p>
            <button 
              onClick={handleNew} 
              className="px-10 py-4 rounded-full border border-accent-cyan/30 text-accent-cyan text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent-cyan hover:text-black transition-all"
            >
              Começar agora
            </button>
          </div>
        )}
      </div>

      {/* Modal: Redesigned for Editorial Precision */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-black border border-white/[0.06] rounded-[2.5rem] p-12 w-full max-w-xl shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="flex items-center justify-between mb-16">
              <div className="space-y-2 border-l-2 border-accent-cyan pl-6">
                <h3 className="text-3xl font-black font-syne text-white uppercase tracking-tighter leading-none">
                  {editingService?.id ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Configurações técnicas & comerciais</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-white transition-all rounded-full border border-white/5 hover:border-white/10"
              >
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Nome da Experiência</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingService?.name || ''} 
                  className="w-full px-8 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-xl font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all"
                  placeholder="Ex: Corte Degrade Editorial"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Descrição</label>
                <textarea 
                  name="description" 
                  defaultValue={editingService?.description || ''} 
                  rows={4}
                  className="w-full px-8 py-6 bg-white/[0.03] border border-white/[0.06] rounded-3xl text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all resize-none leading-relaxed"
                  placeholder="Descreva os diferenciais deste serviço para o cliente..."
                />
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Duração (min)</label>
                  <input 
                    name="duration" 
                    type="number" 
                    min="15" 
                    step="15" 
                    required 
                    defaultValue={editingService?.duration_minutes || 30} 
                    className="w-full px-6 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-center font-mono text-2xl font-black text-white focus:outline-none focus:border-accent-cyan/40 transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Preço (R$)</label>
                  <input 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    required 
                    defaultValue={editingService?.price_cents ? editingService.price_cents / 100 : ''} 
                    className="w-full px-6 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-center font-mono text-2xl font-black text-accent-cyan focus:outline-none focus:border-accent-cyan/40 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Categoria</label>
                <div className="relative">
                  <select 
                    name="category" 
                    required 
                    defaultValue={editingService?.category || 'corte'} 
                    className="w-full px-8 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:border-accent-cyan/40 transition-all appearance-none cursor-pointer font-mono"
                  >
                    <option value="corte" className="bg-black">Corte</option>
                    <option value="barba" className="bg-black">Barba</option>
                    <option value="combo" className="bg-black">Combo</option>
                    <option value="outros" className="bg-black">Outros</option>
                  </select>
                </div>
              </div>

              <div className="pt-12 flex gap-6 border-t border-white/[0.06]">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-5 rounded-full border border-white/[0.06] text-text-muted text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all"
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[1.5] py-5 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                  disabled={isPending}
                >
                  {isPending ? 'Processando...' : 'Confirmar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

