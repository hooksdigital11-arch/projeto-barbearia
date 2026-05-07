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
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent-cyan rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
            <h2 className="text-3xl font-bold font-syne text-white tracking-tight">Serviços Oferecidos</h2>
          </div>
          <p className="text-text-secondary text-lg">Gerencie o cardápio de serviços com experiência premium</p>
        </div>
        <Button onClick={handleNew} variant="cyan" size="lg" className="gap-3 shadow-cyan-500/20 group">
          <Plus size={20} weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
          Novo Serviço
        </Button>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/20 to-accent-blue/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Serviço</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Duração</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Preço</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-white/[0.03] transition-all duration-300 group/row">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-accent-cyan shadow-inner group-hover/row:scale-110 transition-transform duration-500">
                          <Scissors size={24} weight="duotone" />
                        </div>
                        <div className="flex flex-col">
                          <p className="font-bold text-white text-base group-hover/row:text-accent-cyan transition-colors">{service.name}</p>
                          <p className="text-xs text-text-secondary line-clamp-1 opacity-70">{service.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-text-secondary bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {service.duration_minutes} min
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-mono text-base font-bold text-white tracking-tight">
                        {formatPrice(service.price_cents)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full transition-all duration-500",
                          service.is_active ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                        )} />
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          service.is_active ? "text-emerald-400" : "text-red-400 opacity-70"
                        )}>
                          {service.is_active ? 'Ativo' : 'Pausado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleActive(service)}
                          className={cn(
                            "p-2.5 transition-all rounded-xl border border-transparent active:scale-90",
                            service.is_active ? "text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20" : "text-text-secondary hover:bg-accent-cyan/10 hover:text-accent-cyan hover:border-accent-cyan/20"
                          )} 
                          title={service.is_active ? "Pausar Serviço" : "Ativar Serviço"}
                        >
                          {service.is_active ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
                        </button>
                        <button onClick={() => handleDuplicate(service)} className="p-2.5 text-text-secondary hover:text-white transition-all rounded-xl hover:bg-white/5 hover:border-white/10 active:scale-90" title="Duplicar">
                          <Copy size={20} />
                        </button>
                        <button onClick={() => handleEdit(service)} className="p-2.5 text-text-secondary hover:text-white transition-all rounded-xl hover:bg-white/5 hover:border-white/10 active:scale-90" title="Editar">
                          <PencilSimple size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="p-2.5 text-text-secondary hover:text-red-400 transition-all rounded-xl hover:bg-red-500/10 hover:border-red-500/20 active:scale-90"
                          title="Excluir"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {services.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-text-secondary opacity-20">
                <Scissors size={40} weight="thin" />
              </div>
              <p className="text-text-secondary text-lg font-medium">Nenhum serviço cadastrado.</p>
              <Button onClick={handleNew} variant="outline" size="sm">Começar agora</Button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glass-card p-10 w-full max-w-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] border-white/20 animate-in zoom-in-95 duration-500 ease-out">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold font-syne text-white tracking-tight">
                  {editingService?.id ? 'Editar Serviço' : 'Novo Serviço'}
                </h3>
                <p className="text-text-secondary text-sm">Preencha os detalhes do serviço abaixo</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-3 text-text-secondary hover:text-white transition-all rounded-2xl hover:bg-white/5 active:scale-90"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-accent-cyan ml-1">Nome do Serviço</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingService?.name || ''} 
                  className="glass-input w-full text-lg font-medium"
                  placeholder="Ex: Corte Degrade"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Descrição</label>
                <textarea 
                  name="description" 
                  defaultValue={editingService?.description || ''} 
                  className="glass-input w-full min-h-[100px] resize-none"
                  placeholder="Descreva os diferenciais deste serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Duração (min)</label>
                  <input 
                    name="duration" 
                    type="number" 
                    min="15" 
                    step="15" 
                    required 
                    defaultValue={editingService?.duration_minutes || 30} 
                    className="glass-input w-full text-center font-mono text-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Preço (R$)</label>
                  <input 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    required 
                    defaultValue={editingService?.price_cents ? editingService.price_cents / 100 : ''} 
                    className="glass-input w-full text-center font-mono text-xl text-accent-cyan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-secondary ml-1">Categoria</label>
                <select 
                  name="category" 
                  required 
                  defaultValue={editingService?.category || 'corte'} 
                  className="glass-input w-full appearance-none cursor-pointer"
                >
                  <option value="corte">Corte</option>
                  <option value="barba">Barba</option>
                  <option value="combo">Combo</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className="pt-6 flex gap-4">
                <Button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  variant="ghost" 
                  size="lg"
                  className="flex-1"
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="cyan"
                  size="lg"
                  className="flex-[1.5]"
                  disabled={isPending}
                >
                  {isPending ? <CircleNotch size={24} className="animate-spin" /> : 'Salvar Serviço'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

