'use client'

import { useState, useTransition } from 'react'
import { Plus, PencilSimple, Trash, Copy, Scissors, Play, Pause, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import { createService, updateService, deleteService, toggleServiceStatus, duplicateService } from '../actions'
import { CATEGORY_CONFIG } from '../types'
import type { Service, ServiceCategory } from '../types'
import type { CreateServiceInput } from '../schemas'
import { PageTitle } from '@/components/shared/page-title'

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
    <div className="space-y-24 py-12 animate-premium-in">
      {/* Editorial Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <PageTitle 
          title="Serviços" 
          subtitle="Gestão do catálogo de experiências" 
          className="mb-0" 
        />

        <button
          className="btn-pill-primary w-fit"
          onClick={handleNew}
        >
          <div className="flex items-center gap-3">
            <Plus size={20} weight="bold" />
            <span className="uppercase tracking-widest text-[11px]">Novo Serviço</span>
          </div>
        </button>
      </div>

      {/* KPI Cards - Precision Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/5 overflow-hidden">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Ativos', value: stats.active },
          { label: 'Pausados', value: stats.inactive },
          { label: 'Categorias', value: stats.categories },
        ].map((kpi, idx) => (
          <div key={idx} className="p-12 bg-black flex flex-col justify-between h-48 group">
            <p className="label-muted opacity-40 group-hover:opacity-100 transition-opacity">{kpi.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold font-mono text-white tracking-tighter group-hover:text-accent-cyan transition-colors">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
        <button
          onClick={() => setCategoryFilter('')}
          className={cn(
            "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
            !categoryFilter ? "bg-white text-black" : "text-text-muted hover:text-white"
          )}
        >
          TODOS
        </button>
        {categories.map(cat => {
          const config = CATEGORY_CONFIG[cat as ServiceCategory]
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat!)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all",
                categoryFilter === cat ? "bg-white text-black" : "text-text-muted hover:text-white"
              )}
            >
              {((config?.label || (cat || 'Geral'))).toUpperCase()}
            </button>
          )
        })}
      </div>

      {/* Services List */}
      <div className="min-h-[400px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-start py-20">
            <p className="heading-section text-text-muted opacity-20">Nenhum serviço encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(service => {
              const catConfig = CATEGORY_CONFIG[(service.category as ServiceCategory) || 'outros']
              return (
                <div key={service.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12 px-4 hover:bg-white/[0.02] transition-colors items-center group">
                  {/* Name & Desc Column */}
                  <div className="md:col-span-5 flex flex-col space-y-3">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-1.5 h-8 rounded-full" 
                        style={{ backgroundColor: catConfig.color }} 
                      />
                      <span className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-accent-cyan transition-colors">
                        {service.name}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted font-medium leading-relaxed max-w-md ml-5 uppercase tracking-tight opacity-60">
                      {service.description || 'Sem descrição detalhada.'}
                    </p>
                  </div>

                  {/* Details Column */}
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <span className="text-3xl font-mono font-bold text-white tracking-tighter">
                      {service.duration_minutes}
                    </span>
                    <span className="label-muted opacity-40">MINUTOS</span>
                  </div>

                  {/* Price Column */}
                  <div className="md:col-span-2 flex flex-col space-y-1">
                    <span className="text-3xl font-mono font-bold text-accent-cyan tracking-tighter">
                      {formatPrice(service.price_cents)}
                    </span>
                    <span className="label-muted opacity-40">VALOR UNITÁRIO</span>
                  </div>

                  {/* Status Column */}
                  <div className="md:col-span-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        service.is_active ? "bg-emerald-500" : "bg-red-500"
                      )} />
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest",
                        service.is_active ? "text-emerald-400" : "text-red-400"
                      )}>
                        {service.is_active ? 'ATIVO' : 'PAUSADO'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="md:col-span-2 flex items-center justify-end gap-6 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={cn(
                        "text-text-muted transition-colors",
                        service.is_active ? "hover:text-emerald-400" : "hover:text-accent-cyan"
                      )}
                      title={service.is_active ? "Pausar" : "Ativar"}
                    >
                      {service.is_active ? <Pause size={20} weight="bold" /> : <Play size={20} weight="bold" />}
                    </button>
                    <button onClick={() => handleDuplicate(service)} className="text-text-muted hover:text-white transition-colors" title="Duplicar">
                      <Copy size={20} weight="bold" />
                    </button>
                    <button onClick={() => handleEdit(service)} className="text-text-muted hover:text-white transition-colors" title="Editar">
                      <PencilSimple size={20} weight="bold" />
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="text-text-muted hover:text-red-400 transition-colors" title="Excluir">
                      <Trash size={20} weight="bold" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal - Premium Overlay */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-300">
          <div className="bg-black border border-white/10 p-12 w-full max-w-2xl rounded-none animate-in zoom-in-95 duration-500 relative">
             {/* Subtle ambient glow behind modal */}
             <div className="glass-glow bg-accent-cyan top-0 left-0 w-64 h-64" />

            <div className="flex items-center justify-between mb-16 relative z-10">
              <PageTitle 
                title={editingService?.id ? 'Editar' : 'Novo'} 
                subtitle="Configuração de serviço" 
                className="mb-0" 
              />
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-text-muted hover:text-white transition-colors"
              >
                <X size={32} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-16 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="label-muted">NOME DO SERVIÇO</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingService?.name || ''}
                    className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-bold uppercase tracking-tight outline-none focus:border-accent-cyan transition-colors"
                    placeholder="EX: CORTE DEGRADÊ"
                  />
                </div>

                <div className="space-y-4">
                  <label className="label-muted">CATEGORIA</label>
                  <select
                    name="category"
                    required
                    defaultValue={editingService?.category || 'corte'}
                    className="bg-transparent border-b border-white/10 w-full py-4 text-2xl font-bold uppercase tracking-tight outline-none focus:border-accent-cyan transition-colors appearance-none cursor-pointer"
                  >
                    <option value="corte">CORTE</option>
                    <option value="barba">BARBA</option>
                    <option value="combo">COMBO</option>
                    <option value="outros">OUTROS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="label-muted">DESCRIÇÃO</label>
                <textarea
                  name="description"
                  defaultValue={editingService?.description || ''}
                  className="bg-transparent border-b border-white/10 w-full py-4 text-lg font-medium outline-none focus:border-accent-cyan transition-colors resize-none h-24"
                  placeholder="DESCREVA O SERVIÇO..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <label className="label-muted">DURAÇÃO (MIN)</label>
                  <input
                    name="duration"
                    type="number"
                    min="15"
                    step="15"
                    required
                    defaultValue={editingService?.duration_minutes || 30}
                    className="bg-transparent border-b border-white/10 w-full py-4 text-4xl font-mono font-bold outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <label className="label-muted">PREÇO (R$)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    defaultValue={editingService?.price_cents ? editingService.price_cents / 100 : ''}
                    className="bg-transparent border-b border-white/10 w-full py-4 text-4xl font-mono font-bold text-accent-cyan outline-none focus:border-accent-cyan transition-colors"
                  />
                </div>
              </div>

              <div className="pt-12 flex flex-col md:flex-row gap-6">
                <button
                  type="submit"
                  className="btn-pill-primary flex-1"
                  disabled={isPending}
                >
                  {isPending ? 'SALVANDO...' : 'CONFIRMAR REGISTRO'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-pill-secondary flex-1"
                  disabled={isPending}
                >
                  DESCARTAR
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
