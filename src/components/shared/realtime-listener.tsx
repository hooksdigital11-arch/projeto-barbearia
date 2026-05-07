'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface RealtimeListenerProps {
  organizationId: string
  tables?: string[]
}

export function RealtimeListener({ organizationId, tables = ['appointments', 'comanda_items', 'waiting_list', 'clients'] }: RealtimeListenerProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Create a unique channel for this listener
    const channel = supabase.channel(`realtime_${organizationId}`)

    let debounceTimer: NodeJS.Timeout

    tables.forEach(table => {
      channel.on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: table,
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log(`Realtime update on ${table}:`, payload)
          
          // Refetch server components to update the UI
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            router.refresh()
          }, 300)
        }
      )
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Realtime listener ativado para:', tables)
      }
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, router, tables])

  return null // Renderless component
}
