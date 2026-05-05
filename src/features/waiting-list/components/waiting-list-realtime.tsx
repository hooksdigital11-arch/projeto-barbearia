'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface WaitingListRealtimeProps {
  organizationId: string
}

/**
 * Componente invisível que escuta mudanças na tabela waiting_list
 * via Supabase Realtime e atualiza a página automaticamente.
 */
export function WaitingListRealtime({ organizationId }: WaitingListRealtimeProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('waiting-list-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'waiting_list',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, router])

  return null
}
