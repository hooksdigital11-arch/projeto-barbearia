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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-syne text-white">Serviços Oferecidos</h2>
          <p className="text-muted-foreground">Gerencie o cardápio de serviços da sua barbearia</p>
        </div>
        <Button onClick={handleNew} className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 rounded-2xl px-6">
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
                  {service.duration_minutes} min
                </td>
                <td className="px-6 py-5">
                  <span className="font-mono text-sm text-accent-cyan">{formatPrice(service.price_cents)}</span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-colors duration-300",
                      service.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500/50"
                    )} />
                    <span className="text-xs text-muted-foreground">
                      {service.is_active ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button 
                      onClick={() => handleToggleActive(service)}
                      className={cn(
                        "p-2 transition-colors rounded-lg hover:bg-white/5",
                        service.is_active ? "text-emerald-400 hover:text-emerald-300" : "text-muted-foreground hover:text-accent-cyan"
                      )} 
                      title={service.is_active ? "Pausar Serviço" : "Ativar Serviço"}
                    >
                      {service.is_active ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                    </button>
                    <button onClick={() => handleDuplicate(service)} className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Duplicar">
                      <Copy size={18} />
                    </button>
                    <button onClick={() => handleEdit(service)} className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5" title="Editar">
                      <PencilSimple size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                      title="Excluir"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-syne text-white">
                {editingService?.id ? 'Editar Serviço' : 'Novo Serviço'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Nome do Serviço</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingService?.name || ''} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  placeholder="Ex: Corte Degrade"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Descrição</label>
                <input 
                  name="description" 
                  defaultValue={editingService?.description || ''} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  placeholder="Ex: Corte moderno com fade na navalha"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Duração (min)</label>
                  <input 
                    name="duration" 
                    type="number" 
                    min="15" 
                    step="15" 
                    required 
                    defaultValue={editingService?.duration_minutes || 30} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Preço (R$)</label>
                  <input 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    required 
                    defaultValue={editingService?.price_cents ? editingService.price_cents / 100 : ''} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Categoria</label>
                <select 
                  name="category" 
                  required 
                  defaultValue={editingService?.category || 'corte'} 
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 appearance-none"
                >
                  <option value="corte">Corte</option>
                  <option value="barba">Barba</option>
                  <option value="combo">Combo</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  variant="ghost" 
                  className="flex-1 rounded-xl text-white hover:bg-white/5"
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-accent-cyan hover:bg-cyan-400 text-black font-bold rounded-xl"
                  disabled={isPending}
                >
                  {isPending ? <CircleNotch size={20} className="animate-spin" /> : 'Salvar Serviço'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

