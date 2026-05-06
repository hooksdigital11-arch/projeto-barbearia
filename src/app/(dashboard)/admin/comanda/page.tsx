import { Suspense } from 'react'
import { getComandasHistory, getComandasStats } from '@/features/comanda/queries'
import { ComandaPageAdmin } from '@/features/comanda/components/comanda-page-admin'
import { createClient } from '@/lib/supabase/server'
import { requireUser } from '@/lib/auth/require-auth'

export default async function AdminComandaPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; barberId?: string }>
}) {
  const params = await searchParams
  const user = await requireUser()
  const supabase = await createClient()

  // Buscar barbeiros para o filtro
  const { data: barbers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', user.organization_id)
    .in('role', ['admin', 'barber'])

  const stats = await getComandasStats()
  const history = await getComandasHistory({
    period: (params.period as any) || 'today',
    barberId: params.barberId === 'all' ? undefined : params.barberId,
  })

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <Suspense fallback={<div className="animate-pulse h-[400px] bg-muted/50 rounded-lg"></div>}>
        <ComandaPageAdmin 
          stats={stats} 
          history={history}
          initialPeriod={(params.period as 'today' | 'week' | 'month') || 'today'}
        />
      </Suspense>
    </div>
  )
}
