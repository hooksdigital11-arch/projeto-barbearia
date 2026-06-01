'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, PencilSimple, Trash, Play, Pause, X, CircleNotch } from '@phosphor-icons/react'
import { deleteService, createService, updateService, toggleServiceStatus } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { useConfirm } from '@/components/providers/confirm-provider'
import type { Service } from '../types'

export function ServicesSettings({ initialData }: { initialData: Service[] }) {
  const router = useRouter()
  const confirm = useConfirm()
  const [services, setServices] = useState(initialData)
  const [isPending, startTransition] = useTransition()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null)

  // Sincroniza props quando o servidor envia novos dados via router.refresh()
  useEffect(() => {
    setServices(initialData)
  }, [initialData])
  
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
  }

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Excluir Serviço',
      message: 'Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.',
      variant: 'danger',
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    })
    if (!ok) return
    
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
      category: formData.get('category') as "corte" | "barba" | "combo" | "outros",
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
        router.refresh()
      } else {
        toast.error(result.error || 'Erro ao salvar serviço')
      }
    })
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current
    if (!el) return
    const startX = e.pageX - el.offsetLeft
    const scrollLeft = el.scrollLeft

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - el.offsetLeft
      const walk = (x - startX) * 1.5
      el.scrollLeft = scrollLeft - walk
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header Container */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-wider">Catálogo de Serviços</h2>
          <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/65">Gerencie o cardápio de experiências e valores do seu negócio</p>
        </div>
        <button 
          onClick={handleNew} 
          className="flex items-center justify-center gap-2 bg-accent-main text-black px-4 min-h-[44px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.08em] hover:opacity-90 transition-all shrink-0"
        >
          <Plus size={14} weight="bold" />
          Novo Serviço
        </button>
      </div>

      {/* Services Table */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        className="w-full overflow-x-auto scrollbar-none pb-4 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="min-w-[640px] space-y-2.5">
          {/* Table Head */}
          <div className="grid grid-cols-[2fr_90px_90px_80px_70px_70px] gap-3 px-3.5 pb-2.5 items-center">
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/70">Serviço</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/70 text-center">Categoria</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/70 text-center">Duração</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/70 text-center">Investimento</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/70 text-center">Status</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/70 text-right pr-2">Ações</span>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col gap-2.5">
          {services.map((service) => (
            <div 
              key={service.id}
              className="grid grid-cols-[2fr_90px_90px_80px_70px_70px] gap-3 items-center bg-bg-surface border-[0.5px] border-border-main rounded-[8px] p-[12px_14px] hover:bg-bg-surface hover:border-[#222] transition-all relative group"
            >
              {/* Left Accent Bar */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[28px] bg-accent-main opacity-[0.35] rounded-[2px]" />

              {/* Service Info */}
              <div className="flex flex-col truncate pl-1">
                <span className="text-[11px] font-medium text-text-secondary truncate uppercase">{service.name}</span>
                <span className="text-[9px] text-text-muted/50 truncate uppercase tracking-wider">{service.description || 'sem descrição'}</span>
              </div>

              {/* Category Badge */}
              <div className="flex justify-center">
                <span className={cn(
                  "px-[8px] py-[3px] rounded-[5px] text-[8px] font-medium uppercase tracking-[0.05em] border-[0.5px]",
                  service.category?.toUpperCase() === 'CORTE' ? "bg-[#0d2e1a] text-[#00c070] border-[#00c07033]" :
                  service.category?.toUpperCase() === 'BARBA' ? "bg-[#0d1e2e] text-[#6b9fff] border-[#6b9fff33]" :
                  service.category?.toUpperCase() === 'COMBO' ? "bg-[#1e1a0d] text-[#c0a000] border-[#c0a00033]" :
                  "bg-bg-surface text-text-muted/70 border-border-main"
                )}>
                  {service.category}
                </span>
              </div>

              {/* Duration */}
              <span className="text-[10px] text-text-secondary/70 text-center font-medium">{service.duration_minutes} MIN</span>

              {/* Price */}
              <span className="text-[10px] text-text-secondary text-center font-medium">{formatPrice(service.price_cents)}</span>

              {/* Status */}
              <div className="flex items-center justify-center gap-1.5">
                <div className={cn(
                  "w-[5px] h-[5px] rounded-full",
                  service.is_active ? "bg-accent-main" : "bg-[#2a2a2a]"
                )} />
                <span className="text-[9px] text-text-muted/55 uppercase tracking-wider">{service.is_active ? 'ATIVO' : 'OFF'}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pr-1">
                <button 
                  onClick={() => handleEdit(service)}
                  title="Editar" 
                  className="text-text-muted/40 hover:text-text-primary transition-all"
                >
                  <PencilSimple size={13} weight="bold" />
                </button>
                <button 
                  onClick={() => handleToggleActive(service)}
                  disabled={isPending}
                  title={service.is_active ? 'Pausar' : 'Ativar'}
                  className="text-text-muted/40 hover:text-text-primary transition-all"
                >
                  {service.is_active ? <Pause size={13} weight="bold" /> : <Play size={13} weight="bold" />}
                </button>
                <button 
                  onClick={() => handleDelete(service.id)}
                  disabled={isPending}
                  title="Excluir" 
                  className="text-text-muted/40 hover:text-[#ef4444] transition-all"
                >
                  <Trash size={13} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* Empty State */}
      {services.length === 0 && (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-px h-8 bg-[#161616]" />
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted/40">Nenhum serviço cadastrado</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-[500px] bg-bg-black border border-border-main rounded-[12px] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="px-6 py-5 border-b border-border-main/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">
                    {editingService?.id ? 'Editar Serviço' : 'Novo Serviço'}
                  </h3>
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/70">Configurações técnicas & comerciais</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-[28px] h-[28px] flex items-center justify-center text-text-muted/40 hover:text-text-primary transition-all rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Nome da Experiência</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingService?.name || ''} 
                  className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                  placeholder="Ex: Corte Degrade Editorial"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Descrição</label>
                <textarea 
                  name="description" 
                  defaultValue={editingService?.description || ''} 
                  className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all h-[72px] resize-none"
                  placeholder="Descreva os diferenciais deste serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-[10px]">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Duração (min)</label>
                  <input 
                    name="duration" 
                    type="number" 
                    min="15" 
                    step="15" 
                    required 
                    defaultValue={editingService?.duration_minutes || 30} 
                    className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Preço (R$)</label>
                  <input 
                    name="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    required 
                    defaultValue={editingService?.price_cents ? editingService.price_cents / 100 : ''} 
                    className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Categoria</label>
                <select 
                  name="category" 
                  required 
                  defaultValue={editingService?.category || 'corte'} 
                  className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 appearance-none"
                >
                  <option value="corte" className="bg-bg-black">Corte</option>
                  <option value="barba" className="bg-bg-black">Barba</option>
                  <option value="combo" className="bg-bg-black">Combo</option>
                  <option value="outros" className="bg-bg-black">Outros</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-[10px] pt-4 border-t-[0.5px] border-border-main">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="py-[11px] rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main text-[10px] font-medium text-text-muted hover:text-text-primary transition-all"
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex items-center justify-center gap-2 py-[11px] rounded-[7px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
                  disabled={isPending}
                >
                  {isPending ? <CircleNotch size={14} className="animate-spin" /> : <Plus size={14} weight="bold" />}
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
