import { Suspense } from 'react'
import { UserCircle } from '@phosphor-icons/react/dist/ssr'
import { getLoyaltyConfig, getClientStamps } from '@/features/loyalty/queries'
import { LoyaltyPageClient } from '@/features/loyalty/components/loyalty-page-client'
import { requireUser } from '@/lib/auth/require-auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Skeleton } from '@/components/ui/skeleton'

export default async function ClientLoyaltyPage() {
  return (
    <Suspense fallback={<LoyaltySkeleton />}>
      <LoyaltyContent />
    </Suspense>
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
      <div className="space-y-0 animate-in fade-in duration-700">
        <div className="mb-[20px]">
          <h1 className="text-[28px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">Minha Fidelidade</h1>
          <p className="text-[11px] text-[#333] mt-[5px] uppercase tracking-wider font-medium">Acompanhe seus carimbos e resgate suas recompensas.</p>
        </div>
        
        <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] p-[48px_24px] flex flex-col items-center justify-center text-center">
          <div className="w-[56px] h-[56px] rounded-full bg-[#141414] border border-[#1e1e1e] flex items-center justify-center mb-[20px]">
            <UserCircle size={24} className="text-[#2a2a2a]" />
          </div>
          <h2 className="text-[14px] font-medium text-[#555] uppercase tracking-wider mb-[8px]">Perfil de cliente não encontrado</h2>
          <p className="text-[11px] text-[#2e2e2e] leading-[1.6] max-w-[340px] uppercase tracking-wide">
            Seu perfil ainda não está vinculado a um registro de cliente. Entre em contato com a barbearia para ativar seu programa de fidelidade.
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
