'use client'

import { useState, useTransition } from 'react'
import { Warning, Trash, Power, ShieldWarning, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deactivateOrganization } from '../actions'
import { toast } from 'sonner'

export function DangerZone() {
  const [isPending, startTransition] = useTransition()
  const [confirmText, setConfirmText] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDeactivate = () => {
    if (!confirm('Deseja realmente desativar a barbearia? Todos os usuários perderão acesso temporariamente.')) return
    
    startTransition(async () => {
      const result = await deactivateOrganization()
      if (result.success) {
        toast.success('Barbearia desativada com sucesso.')
      } else {
        toast.error(result.error)
      }
    })
  }

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
        <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Power size={20} className="text-red-400" />
                Desativar Barbearia
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Suspende temporariamente todas as atividades. Usuários não poderão logar e o agendamento será bloqueado. Você pode reativar a qualquer momento.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDeactivate}
              disabled={isPending}
              className="border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl px-8"
            >
              {isPending ? <CircleNotch className="animate-spin" /> : 'Desativar Unidade'}
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
