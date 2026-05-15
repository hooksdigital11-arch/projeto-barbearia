'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
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
        router.refresh()
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
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao salvar serviço')
      }
    })
  }

  const categories = Array.from(new Set(services.map(s => s.category).filter(Boolean)))

  return (
    <div className="space-y-12 py-8 animate-premium-in">
      {/* Minimalist Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-[36px] font-medium font-syne text-text-primary tracking-[-0.02em] uppercase leading-none">
            Serviços<span className="text-accent-main">.</span>
          </h1>
          <p className="text-[12px] text-text-secondary font-medium tracking-tight">Gestão do catálogo de experiências</p>
        </div>

        <button
          className="bg-accent-main text-black px-5 py-2.5 rounded-[8px] transition-all hover:opacity-90 active:scale-[0.98]"
          onClick={handleNew}
        >
          <div className="flex items-center gap-2">
            <Plus size={14} weight="regular" />
            <span className="tracking-[0.08em] text-[11px] font-medium uppercase">Novo Serviço</span>
          </div>
        </button>
      </div>

      {/* KPI Cards - Minimalist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px]">
        {[
          { label: 'TOTAL', value: stats.total },
          { label: 'ATIVOS', value: stats.active },
          { label: 'PAUSADOS', value: stats.inactive },
          { label: 'CATEGORIAS', value: stats.categories },
        ].map((item, idx) => (
          <div key={idx} className="bg-bg-surface border-[0.5px] border-border-main rounded-[10px] p-[18px] px-[20px] flex flex-col justify-between h-[110px]">
            <p className="text-[10px] tracking-[0.1em] text-[#444] font-medium uppercase">{item.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[26px] font-medium text-text-primary tracking-tight">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b-[0.5px] border-border-main">
        <button
          onClick={() => setCategoryFilter('')}
          className={cn(
            "px-5 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all",
            !categoryFilter ? "bg-[#1e1e1e] text-text-primary" : "text-text-nav hover:text-text-muted"
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
                "px-5 py-2 rounded-[6px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all",
                categoryFilter === cat ? "bg-[#1e1e1e] text-text-primary" : "text-text-nav hover:text-text-muted"
              )}
            >
              {((config?.label || (cat || 'Geral'))).toUpperCase()}
            </button>
          )
        })}
      </div>

      {/* Services List */}
      <div className="min-h-[400px] space-y-6">
        {/* Column Header — desktop only */}
        <div className="hidden md:grid grid-cols-[2fr_64px_110px_70px_88px] gap-3 px-[18px] pb-2 border-b-[0.5px] border-border-main">
          <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em]">SERVIÇO</span>
          <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em] text-right">DURAÇÃO</span>
          <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em] text-right">PREÇO</span>
          <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em] text-center">STATUS</span>
          <span className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.1em] text-right">AÇÕES</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-start py-20">
            <p className="text-2xl font-medium text-[#222] tracking-tight uppercase">Nenhum registro</p>
          </div>
        ) : (
          <div className="space-y-[4px]">
            {filtered.map(service => (
              <div
                key={service.id}
                className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] group hover:bg-bg-surface hover:border-[#222] transition-all"
              >
                {/* Mobile card layout */}
                <div className="md:hidden p-[14px] flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-[2px] h-[30px] bg-accent-main opacity-35 rounded-[2px] shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-medium text-text-secondary uppercase tracking-[0.05em] truncate">
                          {service.name}
                        </span>
                        <span className="text-[9px] text-[#2e2e2e] font-medium uppercase truncate">
                          {service.description || 'SEM DESCRIÇÃO'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={cn(
                        "w-[5px] h-[5px] rounded-full",
                        service.is_active ? "bg-accent-main" : "bg-red-500 opacity-40"
                      )} />
                      <span className={cn(
                        "text-[9px] font-medium uppercase tracking-[0.08em]",
                        service.is_active ? "text-accent-main" : "text-[#333]"
                      )}>
                        {service.is_active ? 'ATIVO' : 'PAUSADO'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pl-[14px]">
                    <div className="flex items-center gap-3 text-[11px] font-medium text-[#444]">
                      <span>{service.duration_minutes} MIN</span>
                      <span className="text-text-secondary">R$ {(service.price_cents / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleToggleActive(service)} className="text-[#2e2e2e] hover:text-[#666] transition-colors" title={service.is_active ? "Pausar" : "Ativar"}>
                        {service.is_active ? <Pause size={14} weight="regular" /> : <Play size={14} weight="regular" />}
                      </button>
                      <button onClick={() => handleDuplicate(service)} className="text-[#2e2e2e] hover:text-[#666] transition-colors" title="Duplicar">
                        <Copy size={14} weight="regular" />
                      </button>
                      <button onClick={() => handleEdit(service)} className="text-[#2e2e2e] hover:text-[#666] transition-colors" title="Editar">
                        <PencilSimple size={14} weight="regular" />
                      </button>
                      <button onClick={() => handleDelete(service.id)} className="text-[#2e2e2e] hover:text-red-900 transition-colors" title="Excluir">
                        <Trash size={14} weight="regular" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Desktop table row */}
                <div className="hidden md:grid grid-cols-[2fr_64px_110px_70px_88px] gap-3 py-[14px] px-[18px] items-center">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-[2px] h-[30px] bg-accent-main opacity-35 rounded-[2px] shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-medium text-text-secondary uppercase tracking-[0.05em] truncate">
                        {service.name}
                      </span>
                      <span className="text-[9px] text-[#2e2e2e] font-medium uppercase truncate">
                        {service.description || 'SEM DESCRIÇÃO'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[17px] font-medium text-text-primary tracking-tight leading-none">
                      {service.duration_minutes}
                    </span>
                    <span className="text-[8px] text-[#333] font-medium uppercase">MIN</span>
                  </div>

                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-[9px] text-[#444] font-medium uppercase">R$</span>
                    <span className="text-[14px] font-medium text-text-secondary tracking-tight">
                      {(service.price_cents / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <div className={cn(
                      "w-[5px] h-[5px] rounded-full",
                      service.is_active ? "bg-accent-main" : "bg-red-500 opacity-40"
                    )} />
                    <span className={cn(
                      "text-[9px] font-medium uppercase tracking-[0.08em]",
                      service.is_active ? "text-accent-main" : "text-[#333]"
                    )}>
                      {service.is_active ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-[12px]">
                    <button onClick={() => handleToggleActive(service)} className="text-[#2e2e2e] hover:text-[#666] transition-colors" title={service.is_active ? "Pausar" : "Ativar"}>
                      {service.is_active ? <Pause size={14} weight="regular" /> : <Play size={14} weight="regular" />}
                    </button>
                    <button onClick={() => handleDuplicate(service)} className="text-[#2e2e2e] hover:text-[#666] transition-colors" title="Duplicar">
                      <Copy size={14} weight="regular" />
                    </button>
                    <button onClick={() => handleEdit(service)} className="text-[#2e2e2e] hover:text-[#666] transition-colors" title="Editar">
                      <PencilSimple size={14} weight="regular" />
                    </button>
                    <button onClick={() => handleDelete(service.id)} className="text-[#2e2e2e] hover:text-red-900 transition-colors" title="Excluir">
                      <Trash size={14} weight="regular" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Individual Box Design */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-300">
          <div className="bg-bg-surface border-[0.5px] border-border-main p-[28px] px-[30px] w-full max-w-[500px] rounded-[12px] animate-in zoom-in-95 duration-500 relative">
            <div className="flex items-start justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-[28px] font-medium text-text-primary tracking-[-0.02em] leading-none uppercase">
                  Novo<span className="text-accent-main">.</span>
                </h2>
                <p className="text-[11px] text-[#383838] font-medium uppercase tracking-wider">Configuração de serviço</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#2a2a2a] rounded-[6px] text-[#444] transition-all hover:text-text-primary hover:border-[#444]"
              >
                <X size={13} weight="regular" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Block 1: Name & Category */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-[#444] uppercase tracking-[0.1em]">Nome do Serviço</label>
                  <input
                    name="name"
                    required
                    defaultValue={editingService?.name || ''}
                    className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary tracking-[0.04em] outline-none transition-all focus:border-accent-main/20 placeholder:text-[11px] placeholder:text-[#2a2a2a]"
                    placeholder="EX: CORTE DEGRADÊ"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-[#444] uppercase tracking-[0.1em]">Categoria</label>
                  <div className="relative">
                    <select
                      name="category"
                      required
                      defaultValue={editingService?.category || 'corte'}
                      className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary tracking-[0.04em] outline-none transition-all focus:border-accent-main/20 appearance-none cursor-pointer"
                    >
                      <option value="corte">CORTE</option>
                      <option value="barba">BARBA</option>
                      <option value="combo">COMBO</option>
                      <option value="outros">OUTROS</option>
                    </select>
                    <div className="absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 2: Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-medium text-[#444] uppercase tracking-[0.1em]">Descrição</label>
                <textarea
                  name="description"
                  defaultValue={editingService?.description || ''}
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] px-[14px] py-[11px] text-[12px] font-medium text-text-secondary tracking-[0.04em] outline-none transition-all focus:border-accent-main/20 resize-none h-20 placeholder:text-[11px] placeholder:text-[#2a2a2a]"
                  placeholder="DESCREVA O SERVIÇO..."
                />
              </div>

              {/* Separator */}
              <div className="h-[0.5px] bg-[#1a1a1a]" />

              {/* Block 3: Duration & Price */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-[#444] uppercase tracking-[0.1em]">Duração</label>
                  <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[12px] px-[14px] h-[68px] flex flex-col justify-center">
                    <input
                      name="duration"
                      type="number"
                      min="15"
                      step="15"
                      required
                      defaultValue={editingService?.duration_minutes || 30}
                      className="bg-transparent border-none w-full p-0 text-[24px] font-medium text-text-primary outline-none leading-none"
                    />
                    <p className="text-[8px] text-[#2e2e2e] font-medium uppercase tracking-[0.1em] mt-1 leading-none">MINUTOS</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-medium text-[#444] uppercase tracking-[0.1em]">Preço</label>
                  <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[12px] px-[14px] flex items-center h-[68px]">
                    <span className="text-[10px] text-[#333] font-medium uppercase mr-2 mt-1 shrink-0">R$</span>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      defaultValue={editingService?.price_cents ? editingService.price_cents / 100 : ''}
                      className="bg-transparent border-none w-full p-0 text-[24px] font-medium text-text-primary outline-none leading-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-3">
                <button
                  type="submit"
                  className="bg-accent-main text-black py-[13px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 active:scale-[0.98]"
                  disabled={isPending}
                >
                  {isPending ? 'SALVANDO...' : 'CONFIRMAR REGISTRO'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-bg-sidebar border-[0.5px] border-border-main text-[#444] py-[13px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777] active:scale-[0.98]"
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
