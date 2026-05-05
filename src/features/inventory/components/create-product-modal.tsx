'use client'

import { useState, useTransition } from 'react'
import { Package, X, CircleNotch, FloppyDisk } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CustomSelect } from '@/components/ui/custom-select'
import { createProduct } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function CreateProductModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState('revenda')
  const [category, setCategory] = useState('pomada')
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
        toast.success('Produto criado com sucesso!')
        onClose()
      } else {
        toast.error(result.error || 'Erro ao criar produto.')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#141414] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
              <Package size={28} weight="duotone" />
            </div>
            <div>
              <h3 className="text-2xl font-bold font-syne text-white">Novo Produto</h3>
              <p className="text-sm text-muted-foreground">Adicione um novo item ao seu estoque</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {/* Linha 1 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Nome do Produto *</label>
              <Input name="name" required placeholder="Ex: Pomada Efeito Matte" className="bg-white/5 border-white/10 rounded-xl h-12" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Qtd Inicial</label>
                <Input name="quantity" type="number" defaultValue={0} min={0} className="bg-white/5 border-white/10 rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Qtd Mínima</label>
                <Input name="min_quantity" type="number" defaultValue={5} min={0} className="bg-white/5 border-white/10 rounded-xl h-12" />
              </div>
            </div>

            {/* Linha 2 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tipo *</label>
              <CustomSelect
                name="type"
                value={type}
                onChange={setType}
                options={[
                  { value: 'revenda', label: 'Revenda' },
                  { value: 'uso_interno', label: 'Uso Interno' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground truncate block">Custo (R$)</label>
                <Input name="cost_cents" type="number" step="0.01" placeholder="0,00" className="bg-white/5 border-white/10 rounded-xl h-12" />
              </div>
              <div className={cn("space-y-2 transition-all duration-300", type !== 'revenda' && "opacity-20 pointer-events-none")}>
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-cyan truncate block">Venda (R$)</label>
                <Input name="price_cents" type="number" step="0.01" placeholder="0,00" disabled={type !== 'revenda'} className="bg-accent-cyan/5 border-accent-cyan/20 focus:border-accent-cyan text-accent-cyan rounded-xl h-12" />
              </div>
            </div>

            {/* Linha 3 */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Categoria *</label>
              <CustomSelect
                name="category"
                value={category}
                onChange={setCategory}
                options={[
                  { value: 'pomada', label: 'Pomada' },
                  { value: 'shampoo', label: 'Shampoo' },
                  { value: 'lamina', label: 'Lâmina' },
                  { value: 'tesoura', label: 'Tesoura' },
                  { value: 'oleo', label: 'Óleo' },
                  { value: 'creme', label: 'Creme' },
                  { value: 'outros', label: 'Outro' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Fornecedor</label>
              <Input name="supplier" placeholder="Nome do fornecedor" className="bg-white/5 border-white/10 rounded-xl h-12" />
            </div>

            {/* Linha 4 - Descrição e Telefone */}
            <div className="space-y-2 md:row-span-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Descrição</label>
              <textarea 
                name="description" 
                rows={5}
                placeholder="Detalhes sobre o produto..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-all outline-none resize-none h-[124px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Telefone Fornecedor</label>
              <Input 
                name="supplier_phone" 
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(00) 00000-0000" 
                className="bg-white/5 border-white/10 rounded-xl h-12" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex gap-4">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-2xl py-6 text-muted-foreground hover:text-white hover:bg-white/5">
              Cancelar
            </Button>
            <Button disabled={isPending} type="submit" className="flex-1 bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 rounded-2xl py-6 text-base shadow-lg shadow-cyan-500/20">
              {isPending ? <CircleNotch size={24} className="animate-spin" /> : <FloppyDisk size={24} />}
              Salvar Produto
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
