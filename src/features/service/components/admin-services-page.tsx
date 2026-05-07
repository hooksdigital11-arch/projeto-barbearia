'use client'

import { useState, useTransition } from 'react'
import { Plus, PencilSimple, Trash, Copy, Scissors, CircleNotch, Play, Pause, X, Clock, CurrencyDollar } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import { createService, updateService, deleteService, toggleServiceStatus, duplicateService } from '../actions'
import { CATEGORY_CONFIG } from '../types'
import type { Service, ServiceCategory } from '../types'
import type { CreateServiceInput } from '../schemas'

interface ServiceStats {
  total: number
  active: number
  inactive: number
  categories: number
}

interface AdminServicesPageProps {
  services: Service[]
  stats: ServiceStats
}

export function AdminServicesPage({ services: initialServices, stats }: AdminServicesPageProps) {
  const [services, setServices] = useState(initialServices)
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)

  const filtered = categoryFilter
    ? services.filter(s => s.category === categoryFilter)
    : services

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
    setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: newStatus } : s))

    startTransition(async () => {
      const result = await toggleServiceStatus(service.id, newStatus)
      if (!result.success) {
        toast.error(result.error)
        setServices(prev => prev.map(s => s.id === service.id ? { ...s, is_active: !newStatus } : s))
      } else {
        toast.success(newStatus ? 'Serviço ativado!' : 'Serviço pausado!')
      }
    })
  }

  const handleDuplicate = (service: Service) => {
    startTransition(async () => {
      const result = await duplicateService(service.id)
      if (result.success) {
        toast.success('Serviço duplicado! Ele começa como inativo.')
        window.location.reload()
      } else {
        toast.error(result.error)
      }
    })
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

    const input: CreateServiceInput = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      duration: parseInt(formData.get('duration') as string, 10),
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as ServiceCategory,
      isActive: editingService?.is_active ?? true,
    }

    startTransition(async () => {
      const result = editingService?.id
        ? await updateService(editingService.id, input)
        : await createService(input)

      if (result.success) {
        toast.success(editingService?.id ? 'Serviço atualizado!' : 'Serviço criado!')
        setIsModalOpen(false)
        window.location.reload()
      } else {
        toast.error(result.error || 'Erro ao salvar serviço')
      }
    })
  }

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)))

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-accent-cyan rounded-full shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
            <h1 className="text-4xl font-black font-syne text-white tracking-tighter uppercase leading-none">
              Catálogo de <span className="text-accent-cyan">Serviços</span>
            </h1>
          </div>
          <p className="text-text-secondary text-lg font-medium">
            Gerencie o cardápio completo da sua barbearia.
          </p>
        </div>
        <Button onClick={handleNew} variant="cyan" size="lg" className="gap-3 shadow-cyan-500/20 group active:scale-95">
          <Plus size={20} weight="bold" className="group-hover:rotate-90 transition-transform duration-300" />
          Novo Serviço
        </Button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Ativos', value: stats.active, color: 'text-emerald-400' },
          { label: 'Pausados', value: stats.inactive, color: 'text-amber-400' },
          { label: 'Categorias', value: stats.categories, color: 'text-accent-cyan' },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card p-6 flex flex-col gap-2 group hover:scale-[1.02] transition-all duration-500">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">{kpi.label}</span>
            <span className={cn("text-3xl font-black tracking-tighter", kpi.color)}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setCategoryFilter('')}
          className={cn(
            "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0",
            !categoryFilter ? "bg-white text-black shadow-lg" : "bg-white/5 text-text-secondary border border-white/5 hover:text-white"
          )}
        >
          Todos
        </button>
        {categories.map(cat => {
          const config = CATEGORY_CONFIG[cat as ServiceCategory]
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat!)}
              className={cn(
                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0",
                categoryFilter === cat
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/5 text-text-secondary border border-white/5 hover:text-white"
              )}
            >
              {config?.label || cat}
            </button>
          )
        })}
      </div>

      {/* Services Table */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 rounded-[2.5rem] blur-xl opacity-50 transition-opacity" />
        <div className="relative glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Serviço</th>
                  <th className="text-left text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Categoria</th>
                  <th className="text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Duração</th>
                  <th className="text-right text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Preço</th>
                  <th className="text-center text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Status</th>
                  <th className="text-right text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-8 py-6">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filtered.map(service => {
                  const catConfig = CATEGORY_CONFIG[(service.category as ServiceCategory) || 'outros']
                  return (
                    <tr key={service.id} className="group/row hover:bg-white/[0.03] transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-white/10 group-hover/row:scale-110 transition-transform duration-500"
                            style={{ backgroundColor: `${catConfig.color}15`, borderColor: `${catConfig.color}30` }}
                          >
                            <Scissors size={22} weight="duotone" style={{ color: catConfig.color }} />
                          </div>
                          <div>
                            <p className="text-base font-bold text-white group-hover/row:text-accent-cyan transition-colors">{service.name}</p>
                            <p className="text-xs text-text-secondary line-clamp-1 opacity-60 mt-0.5">{service.description || 'Sem descrição'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border"
                          style={{ backgroundColor: `${catConfig.color}10`, borderColor: `${catConfig.color}20`, color: catConfig.color }}
                        >
                          {catConfig.label}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-text-secondary">
                          <Clock size={14} weight="bold" />
                          <span className="text-sm font-bold text-white">{service.duration_minutes}min</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-lg font-black text-accent-cyan font-mono tracking-tight">
                          {formatPrice(service.price_cents)}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            service.is_active ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" : "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            service.is_active ? "text-emerald-400" : "text-red-400"
                          )}>
                            {service.is_active ? 'Ativo' : 'Pausado'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-40 group-hover/row:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => handleToggleActive(service)}
                            className={cn(
                              "tap-target glass rounded-xl border border-transparent active:scale-90 transition-all",
                              service.is_active ? "text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20" : "text-text-secondary hover:bg-accent-cyan/10 hover:text-accent-cyan hover:border-accent-cyan/20"
                            )}
                            title={service.is_active ? "Pausar" : "Ativar"}
                          >
                            {service.is_active ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
                          </button>
                          <button onClick={() => handleDuplicate(service)} className="tap-target glass rounded-xl text-text-secondary hover:text-white hover:bg-white/10 active:scale-90 transition-all" title="Duplicar">
                            <Copy size={18} />
                          </button>
                          <button onClick={() => handleEdit(service)} className="tap-target glass rounded-xl text-text-secondary hover:text-white hover:bg-white/10 active:scale-90 transition-all" title="Editar">
                            <PencilSimple size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className="tap-target glass rounded-xl text-text-secondary hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 active:scale-90 transition-all"
                            title="Excluir"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-32 text-center flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-text-secondary opacity-20">
                <Scissors size={48} weight="thin" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold font-syne text-white uppercase tracking-tight">Nenhum serviço encontrado</p>
                <p className="text-text-secondary">Cadastre o primeiro serviço para começar.</p>
              </div>
              <Button onClick={handleNew} variant="outline" size="sm">Criar Serviço</Button>
            </div>
          )}
        </div>
      </div>

      {/* Results Counter */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-center py-2">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary opacity-40">
            {filtered.length} {filtered.length === 1 ? 'serviço' : 'serviços'}
          </p>
        </div>
      )}

      {/* Modal */}
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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan ml-1">Nome do Serviço</label>
                <input
                  name="name"
                  required
                  defaultValue={editingService?.name || ''}
                  className="glass-input w-full text-lg font-medium"
                  placeholder="Ex: Corte Degrade"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={editingService?.description || ''}
                  className="glass-input w-full min-h-[100px] resize-none"
                  placeholder="Descreva os diferenciais deste serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Duração (min)</label>
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
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Preço (R$)</label>
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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Categoria</label>
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
