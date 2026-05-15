import { Suspense } from 'react'
import { getComandasHistory, getComandasStats } from '@/features/comanda/queries'
import { ComandaPageAdmin } from '@/features/comanda/components/comanda-page-admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/require-auth'

export default async function AdminComandaPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; barberId?: string }>
}) {
  const params = await searchParams
  const user = await requireAdmin()
  const supabase = await createClient()

  // Buscar dados em paralelo para evitar waterfalls
  const [barbersResponse, stats, history] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name')
      .eq('organization_id', user.organization_id)
      .in('role', ['admin', 'barber']),
    getComandasStats(),
    getComandasHistory({
      period: (params.period as any) || 'today',
      barberId: params.barberId === 'all' ? undefined : params.barberId,
    })
  ])

  const barbers = barbersResponse.data || []

  return (
    <Suspense fallback={<div className="animate-pulse h-[400px] bg-muted/50 rounded-lg" />}>
      <ComandaPageAdmin
        stats={stats}
        history={history}
        initialPeriod={(params.period as 'today' | 'week' | 'month') || 'today'}
      />
    </Suspense>
  )
}
