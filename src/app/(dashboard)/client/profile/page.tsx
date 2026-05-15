import { requireClient } from '@/lib/auth/require-auth'
import { Envelope, Phone, Calendar } from '@phosphor-icons/react/dist/ssr'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ProfileEditForm } from '@/features/client/components/profile-edit-form'

export const metadata = {
  title: 'Meu Perfil | Cliente',
  description: 'Seus dados de perfil.',
}

export default async function ClientProfileRoute() {
  const user = await requireClient()

  return (
    <div className="space-y-0 animate-in fade-in duration-700">
      <div className="mb-[20px] flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-medium text-[#2a2a2a] uppercase tracking-[0.14em] mb-[6px]">CONTA</p>
          <h1 className="text-[28px] font-medium text-[#fff] tracking-[-0.01em] uppercase leading-none">Meu Perfil</h1>
          <p className="text-[11px] text-[#333] mt-[5px] uppercase tracking-wider font-medium">Gerencie seus dados pessoais.</p>
        </div>
        <ProfileEditForm
          initialName={user.full_name || ''}
          initialPhone={user.phone || ''}
        />
      </div>

      <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-[10px] overflow-hidden max-w-[560px]">
        {/* Hero do Card */}
        <div className="bg-[#0d0d0d] border-b border-[#161616] p-[20px_22px] flex items-center gap-[14px]">
          <div className="w-[44px] h-[44px] rounded-[10px] bg-[#1a1a2e] text-[#8b7cf6] flex items-center justify-center font-medium text-[16px] border border-[#2a2a3e] shrink-0">
            {user.full_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-[16px] font-medium text-[#fff] uppercase tracking-tight leading-none">{user.full_name}</h2>
            <p className="text-[10px] text-[#383838] mt-[3px] uppercase tracking-wider">Cliente desde {new Date(user.created_at || Date.now()).getFullYear()}</p>
          </div>
        </div>

        {/* Corpo do Card — read-only quando não está editando */}
        <div className="flex flex-col" id="profile-fields">
          {/* Item: Email */}
          <div className="p-[16px_22px] border-b border-[#141414]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <Envelope size={12} className="text-[#2a2a2a]" weight="bold" />
              <p className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Email</p>
            </div>
            <p className="text-[12px] text-[#888] font-medium">{user.email || 'Não informado'}</p>
          </div>

          {/* Item: Telefone */}
          <div className="p-[16px_22px] border-b border-[#141414]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <Phone size={12} className="text-[#2a2a2a]" weight="bold" />
              <p className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Telefone</p>
            </div>
            <p className="text-[12px] text-[#888] font-medium">{user.phone || 'Não informado'}</p>
          </div>

          {/* Item: Data de Criação */}
          <div className="p-[16px_22px]">
            <div className="flex items-center gap-[6px] mb-[6px]">
              <Calendar size={12} className="text-[#2a2a2a]" weight="bold" />
              <p className="text-[9px] font-medium text-[#383838] uppercase tracking-[0.1em]">Conta criada em</p>
            </div>
            <p className="text-[12px] text-[#888] font-medium">
              {format(new Date(user.created_at || Date.now()), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
