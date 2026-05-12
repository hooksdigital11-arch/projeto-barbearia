'use client'

import { useState, useTransition } from 'react'
import { Warning, Trash, Power, CheckCircle, CircleNotch } from '@phosphor-icons/react'
import { deactivateOrganization, activateOrganization } from '../actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function DangerZone({ initialStatus = 'active' }: { initialStatus?: string }) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(initialStatus)
  const [confirmText, setConfirmText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeactivate = () => {
    if (!confirm('Deseja realmente desativar a barbearia? Todos os usuários perderão acesso temporariamente.')) return
    
    startTransition(async () => {
      const result = await deactivateOrganization()
      if (result.success) {
        setStatus('inactive')
        toast.success('Barbearia desativada com sucesso.')
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleActivate = () => {
    startTransition(async () => {
      const result = await activateOrganization()
      if (result.success) {
        setStatus('active')
        toast.success('Barbearia reativada com sucesso!')
      } else {
        toast.error(result.error)
      }
    })
  }

  const isInactive = status === 'inactive'

  return (
    <div className="max-w-4xl">
      <div className="bg-bg-sidebar border-[0.5px] border-[#2a1010] rounded-[10px] overflow-hidden shadow-[0_10px_40px_rgba(192,64,64,0.03)]">
        
        {/* Header */}
        <div className="bg-[#0d0808] border-b-[0.5px] border-[#2a1010] p-[20px_24px] flex items-center gap-3">
          <div className="w-[36px] h-[36px] bg-[#2a0d0d] border-[0.5px] border-[#c0404033] rounded-[8px] flex items-center justify-center text-[#c04040]">
            <Warning size={18} weight="bold" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[18px] font-medium text-[#e05050] uppercase tracking-[0.04em]">Zona de Perigo</h2>
            <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#4a2020]">Ações críticas e irreversíveis para sua unidade</p>
          </div>
        </div>

        {/* Actions List */}
        <div className="flex flex-col">
          
          {/* Desativar / Reativar */}
          <div className="p-[20px_24px] border-b-[0.5px] border-[#1a0808] flex items-center justify-between gap-6 transition-all duration-500">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                {isInactive ? (
                  <CheckCircle size={16} weight="bold" className="text-accent-main" />
                ) : (
                  <Power size={16} weight="bold" className="text-[#c04040]" />
                )}
                <span className={cn(
                  "text-[14px] font-medium tracking-[0.04em] uppercase",
                  isInactive ? "text-accent-main" : "text-[#e05050]"
                )}>
                  {isInactive ? 'Barbearia Suspensa' : 'Desativar Unidade'}
                </span>
              </div>
              <p className="text-[11px] text-[#4a2a2a] leading-[1.6] max-w-[440px]">
                {isInactive 
                  ? 'A unidade está suspensa. Os clientes não conseguem agendar e os funcionários não têm acesso ao sistema.' 
                  : 'Suspende temporariamente todas as atividades. Usuários não poderão logar e o agendamento será bloqueado.'}
              </p>
              {!isInactive && (
                <span className="text-[10px] text-[#c04040] font-medium uppercase tracking-wider">Esta ação é reversível.</span>
              )}
            </div>
            
            <button 
              onClick={isInactive ? handleActivate : handleDeactivate}
              disabled={isPending}
              className={cn(
                "flex items-center gap-2 border-[0.5px] rounded-[8px] p-[10px_18px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all flex-shrink-0",
                isInactive 
                  ? "bg-[#0d2e29] border-accent-main/20 text-accent-main hover:bg-accent-main hover:text-black"
                  : "bg-transparent border-[#c04040] text-[#c04040] hover:bg-[#2a0d0d]"
              )}
            >
              {isPending ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <>
                  <Power size={14} weight="bold" />
                  {isInactive ? 'Reativar Agora' : 'Desativar'}
                </>
              )}
            </button>
          </div>

          {/* Exclusão Permanente */}
          <div className="p-[20px_24px] bg-[#0d0808] relative overflow-hidden group">
            {/* Glow effect */}
            <div className="absolute inset-0 pointer-events-none opacity-40" 
              style={{ background: 'radial-gradient(ellipse at 50% 100%, #c0404008, transparent)' }} />
            
            <div className="flex flex-col gap-1.5 relative z-10">
              <div className="flex items-center gap-2">
                <Trash size={16} weight="bold" className="text-[#c04040]" />
                <span className="text-[14px] font-medium text-[#e05050] tracking-[0.04em] uppercase">Exclusão Permanente</span>
              </div>
              <p className="text-[11px] text-[#4a2a2a] leading-[1.6] max-w-[440px]">
                Apaga permanentemente todos os dados da sua organização, incluindo usuários, serviços, histórico e financeiro.
              </p>
              <span className="text-[10px] text-[#c04040] font-medium uppercase tracking-wider">Esta ação é irreversível.</span>

              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 w-fit bg-[#c04040] text-text-primary px-[20px] py-[11px] rounded-[8px] text-[10px] font-medium uppercase tracking-[0.1em] mt-[14px] hover:bg-[#a03030] transition-all shadow-[0_0_20px_rgba(192,64,64,0.15)]"
                >
                  <Trash size={14} weight="bold" />
                  Deletar Organização
                </button>
              ) : (
                <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="bg-[#1a0d0d] border-[0.5px] border-[#c0404033] rounded-[8px] p-4">
                    <p className="text-[10px] text-text-primary font-medium uppercase tracking-tight">
                      Para confirmar, digite <span className="text-[#c04040] font-bold">DELETAR ORGANIZAÇÃO</span> abaixo:
                    </p>
                    <div className="flex flex-col md:flex-row gap-3 mt-4">
                      <input 
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="Digite o texto de confirmação"
                        className="flex-1 bg-black border-[0.5px] border-[#2a1010] rounded-[8px] p-[10px_14px] text-[12px] text-text-primary placeholder:text-[#3a1a1a] focus:outline-none focus:border-[#c04040] transition-all"
                      />
                      <div className="flex gap-2">
                        <button 
                          disabled={confirmText !== 'DELETAR ORGANIZAÇÃO' || isPending}
                          className="px-[20px] py-[10px] rounded-[8px] bg-[#c04040] text-text-primary text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-20 transition-all shadow-[0_0_20px_rgba(192,64,64,0.15)]"
                        >
                          Confirmar
                        </button>
                        <button 
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setConfirmText('')
                          }}
                          className="px-[18px] py-[10px] rounded-[8px] bg-transparent border-[0.5px] border-border-main text-[10px] font-medium text-[#444] uppercase tracking-wider hover:bg-bg-surface transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
