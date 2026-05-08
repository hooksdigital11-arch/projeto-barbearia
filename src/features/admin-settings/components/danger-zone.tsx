'use client'

import { useState, useTransition } from 'react'
import { Warning, Trash, Power, ShieldWarning, CircleNotch, CheckCircle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    <div className="space-y-16">
      <div>
        <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter flex items-center gap-6">
          <Warning size={40} className="text-red-500" />
          Zona de Perigo
        </h2>
        <p className="label-muted mt-2">Ações críticas e irreversíveis para sua unidade</p>
      </div>

      <div className="grid gap-6">
        {/* Deactivate Section */}
        <div className={cn(
          "p-10 rounded-[2.5rem] border transition-all duration-700 relative overflow-hidden",
          isInactive 
            ? "border-emerald-500/20 bg-emerald-500/[0.03]" 
            : "border-red-500/10 bg-red-500/[0.03]"
        )}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-3">
              <h3 className={cn(
                "text-xl font-black uppercase tracking-tighter flex items-center gap-3",
                isInactive ? "text-emerald-500" : "text-white"
              )}>
                {isInactive ? (
                  <CheckCircle size={24} />
                ) : (
                  <Power size={24} />
                )}
                {isInactive ? 'Barbearia Desativada' : 'Desativar Unidade'}
              </h3>
              <p className="text-sm font-medium text-text-muted max-w-md leading-relaxed">
                {isInactive 
                  ? 'A unidade está suspensa. Os clientes não conseguem agendar e os funcionários não têm acesso ao sistema.' 
                  : 'Suspende temporariamente todas as atividades. Usuários não poderão logar e o agendamento será bloqueado.'}
              </p>
            </div>
            <button 
              onClick={isInactive ? handleActivate : handleDeactivate}
              disabled={isPending}
              className={cn(
                "px-10 py-3.5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all",
                isInactive 
                  ? "bg-emerald-500 text-black hover:scale-[1.02] active:scale-[0.98]"
                  : "border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
              )}
            >
              {isPending ? 'Processando...' : (isInactive ? 'Reativar Unidade' : 'Desativar Unidade')}
            </button>
          </div>
        </div>

        {/* Delete Section */}
        <div className="p-10 rounded-[2.5rem] border border-red-500/10 bg-red-500/[0.03] space-y-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-red-500 flex items-center gap-4 uppercase tracking-tighter leading-none">
              <Trash size={32} />
              Exclusão Permanente
            </h3>
            <p className="text-sm font-medium text-text-muted max-w-2xl leading-relaxed">
              Apaga permanentemente todos os dados: usuários, serviços, histórico de agendamentos, clientes e financeiro. 
              <strong className="text-red-500 ml-2 font-black">ESTA AÇÃO É IRREVERSÍVEL.</strong>
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-10 py-3.5 rounded-full bg-red-500 text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Deletar Organização
            </button>
          ) : (
            <div className="space-y-8">
              <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
                <p className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em]">Confirmação Necessária</p>
              </div>
              <div className="space-y-4">
                <p className="text-sm font-bold text-white uppercase tracking-tight">Para confirmar, digite <span className="text-red-500 font-black">DELETAR ORGANIZAÇÃO</span> abaixo:</p>
                <div className="flex flex-col md:flex-row gap-6">
                  <input 
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Digite o texto de confirmação"
                    className="flex-1 px-6 py-4 bg-black border border-red-500/20 rounded-2xl text-white placeholder:text-red-500/20 focus:outline-none focus:border-red-500/50 transition-all font-bold"
                  />
                  <div className="flex gap-4">
                    <button 
                      disabled={confirmText !== 'DELETAR ORGANIZAÇÃO' || isPending}
                      className="px-10 py-3.5 rounded-full bg-red-500 text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20"
                    >
                      Confirmar
                    </button>
                    <button 
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setConfirmText('')
                      }}
                      className="px-8 py-3.5 rounded-full border border-white/[0.06] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
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
  )
}
