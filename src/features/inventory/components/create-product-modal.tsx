'use client'

import { useState, useTransition } from 'react'
import { Package, X, CircleNotch, Plus, CaretDown } from '@phosphor-icons/react'
import { createProduct } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function CreateProductModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [phone, setPhone] = useState('')

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits.length ? `(${digits}` : ''
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  if (!isOpen) return null

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await createProduct(formData)
      if (result.success) {
        toast.success('PRODUTO CADASTRADO!')
        onClose()
      } else {
        toast.error(result.error || 'ERRO AO CADASTRAR.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[500px] rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-[24px] pb-5">
          <div className="flex items-center gap-4">
            <div className="w-[32px] h-[32px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-text-nav shrink-0">
              <Package size={18} weight="regular" />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Novo Item</h2>
              <p className="text-[10px] text-[#383838] font-medium uppercase tracking-wide">Cadastrar produto no estoque</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary"
          >
            <X size={12} weight="regular" />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto px-[24px] pb-[24px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Nome do Produto <span className="text-accent-main">*</span></label>
              <input
                name="name"
                required
                placeholder="NOME DO ITEM..."
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase placeholder:text-[#222]"
              />
            </div>

            {/* Grid QTDs */}
            <div className="grid grid-cols-2 gap-[10px]">
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">QTD Inicial</label>
                <input
                  name="quantity"
                  type="number"
                  min={0}
                  placeholder="0"
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">QTD Mínima</label>
                <input
                  name="min_quantity"
                  type="number"
                  min={0}
                  placeholder="5"
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Tipo <span className="text-accent-main">*</span></label>
              <div className="relative">
                <select
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] pr-[30px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                >
                  <option value="" disabled>SELECIONAR TIPO...</option>
                  <option value="revenda">REVENDA</option>
                  <option value="uso_interno">USO INTERNO</option>
                </select>
                <div className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                  <CaretDown size={14} weight="regular" />
                </div>
              </div>
            </div>

            {/* Grid Custos */}
            <div className="grid grid-cols-2 gap-[10px]">
              <div className="space-y-2">
                <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Custo (R$)</label>
                <input
                  name="cost_cents"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
              <div className={cn("space-y-2 transition-opacity", type !== 'revenda' && type !== '' && "opacity-20 pointer-events-none")}>
                <label className="text-[9px] font-medium text-accent-main uppercase tracking-[0.12em]">Venda (R$)</label>
                <input
                  name="price_cents"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  disabled={type !== 'revenda' && type !== ''}
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Categoria <span className="text-accent-main">*</span></label>
              <div className="relative">
                <select
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full appearance-none bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] pr-[30px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase cursor-pointer"
                >
                  <option value="" disabled>SELECIONAR CATEGORIA...</option>
                  <option value="pomada">POMADA</option>
                  <option value="shampoo">SHAMPOO</option>
                  <option value="lamina">LÂMINA</option>
                  <option value="tesoura">TESOURA</option>
                  <option value="oleo">ÓLEO</option>
                  <option value="creme">CREME</option>
                  <option value="outros">OUTRO</option>
                </select>
                <div className="absolute right-[10px] top-1/2 -translate-y-1/2 pointer-events-none text-[#333]">
                  <CaretDown size={14} weight="regular" />
                </div>
              </div>
            </div>

            {/* Fornecedor */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Fornecedor</label>
              <input
                name="supplier"
                placeholder="NOME DO FORNECEDOR..."
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 uppercase placeholder:text-[#222]"
              />
            </div>

            {/* Telefone Fornecedor */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Telefone Fornecedor</label>
              <input
                name="supplier_phone"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.12em]">Descrição</label>
              <textarea
                name="description"
                rows={3}
                placeholder="DETALHES SOBRE O PRODUTO..."
                className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] px-[13px] py-[10px] text-[12px] font-medium text-text-secondary outline-none transition-all focus:border-accent-main/20 resize-none uppercase placeholder:text-[#222]"
              />
            </div>

            {/* Footer Actions */}
            <div className="grid grid-cols-2 gap-[10px] pt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-bg-sidebar border-[0.5px] border-border-main text-[#444] py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:border-[#333] hover:text-[#777]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center gap-2 bg-accent-main text-black py-[12px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] transition-all hover:opacity-90 disabled:opacity-40"
              >
                {isPending ? (
                  <CircleNotch size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} weight="bold" />
                )}
                CADASTRAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
