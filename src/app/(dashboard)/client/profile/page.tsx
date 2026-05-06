import { requireClient } from '@/lib/auth/require-auth'
import { User, Mail, Phone, Calendar } from 'lucide-react'

export const metadata = {
  title: 'Meu Perfil | Cliente',
  description: 'Seus dados de perfil.',
}

export default async function ClientProfileRoute() {
  const user = await requireClient()

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-8">
      <div>
        <p className="text-xs font-bold text-accent-cyan uppercase tracking-[0.2em] mb-2">CONTA</p>
        <h1 className="text-3xl font-bold font-syne text-white uppercase tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Visualize seus dados pessoais.
        </p>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-white/5 p-6 max-w-2xl space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
          <div className="w-16 h-16 rounded-full bg-accent-cyan/10 flex items-center justify-center text-accent-cyan font-bold text-2xl uppercase">
            {user.full_name?.charAt(0) || 'C'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-syne">{user.full_name}</h2>
            <p className="text-sm text-muted-foreground">Cliente desde {new Date(user.created_at || Date.now()).getFullYear()}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email
            </p>
            <p className="text-white font-medium">{user.email || 'Não informado'}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Phone className="w-3 h-3" /> Telefone
            </p>
            <p className="text-white font-medium">{user.phone || 'Não informado'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Conta criada em
            </p>
            <p className="text-white font-medium">
              {new Date(user.created_at || Date.now()).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
