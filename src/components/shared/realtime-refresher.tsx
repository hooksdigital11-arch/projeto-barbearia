'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RealtimeRefresher({ organizationId }: { organizationId: string }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase.channel('global-realtime-refresher')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loyalty_stamps' },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comanda_items' },
        () => router.refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  return null
}
