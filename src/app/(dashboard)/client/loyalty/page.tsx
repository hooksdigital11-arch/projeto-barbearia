import { Suspense } from 'react'
import { getLoyaltyConfig, getClientStamps } from '@/features/loyalty/queries'
import { LoyaltyPageClient } from '@/features/loyalty/components/loyalty-page-client'
import { requireUser } from '@/lib/auth/require-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ClientLoyaltyPage() {
  return (
    <main className="p-6 md:p-10 max-w-7xl mx-auto w-full">
      <Suspense fallback={<LoyaltySkeleton />}>
        <LoyaltyContent />
      </Suspense>
    </main>
  )
}

async function LoyaltyContent() {
  const user = await requireUser()

  // Buscar o client_id vinculado ao profile do usuário logado
  const { data: client } = await supabaseAdmin
    .from('clients')
    .select('id')
    .eq('organization_id', user.organization_id)
    .eq('profile_id', user.id)
    .single()

  if (!client) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div>
          <h1 className="text-4xl font-bold font-syne text-text-primary tracking-tight">Minha Fidelidade</h1>
          <p className="text-muted-foreground mt-1 text-sm">Acompanhe seus carimbos e resgate suas recompensas.</p>
        </div>
        <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-16 text-center space-y-4">
          <p className="text-text-primary font-bold text-lg">Perfil de cliente não encontrado</p>
          <p className="text-sm text-muted-foreground">
            Seu perfil ainda não está vinculado a um registro de cliente. Entre em contato com a barbearia.
          </p>
        </div>
      </div>
    )
  }

  const [config, { balance, history }] = await Promise.all([
    getLoyaltyConfig(),
    getClientStamps(client.id),
  ])

  return (
    <LoyaltyPageClient
      config={config}
      balance={balance}
      history={history}
      clientId={client.id}
    />
  )
}

function LoyaltySkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-64 rounded-[2rem]" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[250px] rounded-[2rem]" />
    </div>
  )
}
