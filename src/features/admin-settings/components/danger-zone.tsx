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
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold font-syne text-white flex items-center gap-3">
          <Warning size={32} className="text-red-500" weight="fill" />
          Zona de Perigo
        </h2>
        <p className="text-muted-foreground mt-2">Ações críticas e irreversíveis para sua conta e organização.</p>
      </div>

      <div className="grid gap-6">
        {/* Deactivate Section */}
        <div className={cn(
          "p-8 rounded-[2rem] border transition-all duration-500",
          isInactive 
            ? "border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]" 
            : "border-red-500/20 bg-red-500/5"
        )}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className={cn(
                "text-lg font-bold flex items-center gap-2",
                isInactive ? "text-emerald-400" : "text-white"
              )}>
                {isInactive ? (
                  <CheckCircle size={20} className="text-emerald-400" weight="fill" />
                ) : (
                  <Power size={20} className="text-red-400" />
                )}
                {isInactive ? 'Barbearia Desativada' : 'Desativar Barbearia'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {isInactive 
                  ? 'A unidade está suspensa. Os clientes não conseguem agendar e os funcionários não têm acesso ao sistema.' 
                  : 'Suspende temporariamente todas as atividades. Usuários não poderão logar e o agendamento será bloqueado.'}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={isInactive ? handleActivate : handleDeactivate}
              disabled={isPending}
              className={cn(
                "rounded-xl px-8 transition-all duration-300 font-bold",
                isInactive 
                  ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  : "border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white"
              )}
            >
              {isPending ? <CircleNotch className="animate-spin" /> : (isInactive ? 'Reativar Unidade' : 'Desativar Unidade')}
            </Button>
          </div>
        </div>

        {/* Delete Section */}
        <div className="p-8 rounded-[2rem] border border-red-600/30 bg-red-600/5 space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <Trash size={20} />
              Exclusão Permanente
            </h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Apaga permanentemente todos os dados: usuários, serviços, histórico de agendamentos, clientes e financeiro. 
              <strong className="text-red-400 ml-1">Esta ação é irreversível e não pode ser desfeita.</strong>
            </p>
          </div>

          {!showDeleteConfirm ? (
            <Button 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8"
            >
              Deletar Organização
            </Button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <ShieldWarning size={20} className="text-red-400" weight="fill" />
                <p className="text-xs text-red-400 font-bold uppercase tracking-widest">Confirmação Necessária</p>
              </div>
              <p className="text-sm text-white">Para confirmar, digite <span className="font-mono font-bold text-red-400">DELETAR ORGANIZAÇÃO</span> abaixo:</p>
              <div className="flex flex-col md:flex-row gap-4">
                <Input 
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Digite o texto de confirmação"
                  className="bg-black/40 border-red-500/30 focus:border-red-500 text-white flex-1"
                />
                <Button 
                  disabled={confirmText !== 'DELETAR ORGANIZAÇÃO' || isPending}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-8 disabled:opacity-20"
                >
                  Confirmar Exclusão Total
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setConfirmText('')
                  }}
                  className="text-muted-foreground hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
