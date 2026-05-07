'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

/**
 * BÔNUS DE UX: Hook Realtime Simples para Dashboards
 * 
 * Este hook conecta o cliente ao Supabase Realtime e escuta mudanças apenas na
 * organização do usuário atual. Quando ocorre um INSERT (novo agendamento) 
 * ou UPDATE (agendamento concluído), ele faz o router.refresh() que forçará o 
 * Server Component a buscar as novas stats sem dar F5 na página inteira.
 * 
 * Uso: 
 * No seu AdminDashboard (Client Component):
 * useDashboardRealtime(organizationId)
 */
export function useDashboardRealtime(organizationId: string) {
  const router = useRouter()

  useEffect(() => {
    if (!organizationId) return

    const supabase = createClient()
    
    // Inscreve no canal do Postgres para a tabela 'appointments'
    const channel = supabase.channel('dashboard-appointments-sync')
      .on(
        'postgres_changes',
        { 
          event: '*', // Escuta INSERT, UPDATE e DELETE
          schema: 'public', 
          table: 'appointments',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          // Bônus visual: feedback para o usuário
          if (payload.eventType === 'INSERT') {
            toast.success('Novo agendamento recebido!')
          } else if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status
            if (newStatus === 'completed') {
              toast.success('Agendamento concluído! Receita atualizada.')
            }
          }
          
          // O Next.js atualiza o cache da rota transparentemente
          // O Server Component (page.tsx) vai re-rodar as queries (nossas Views) 
          // e o componente será re-renderizado com os novos dados sem piscar.
          router.refresh()
        }
      )
      .subscribe()

    // Limpeza de cache ao desmontar
    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, router])
}
