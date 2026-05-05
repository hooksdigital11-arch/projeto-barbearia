import { SettingsLayout } from '@/features/admin-settings/components/settings-layout'
import { PageTitle } from '@/components/shared/page-title'
import { requireAdmin } from '@/lib/auth/require-auth'

export default async function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="p-4 md:p-8 space-y-8">
      <PageTitle 
        title="Configurações Administrativas" 
        subtitle="Gerencie todos os aspectos da sua barbearia em um só lugar" 
      />
      
      <SettingsLayout>
        {children}
      </SettingsLayout>
    </div>
  )
}
