'use client'

import { useState, useTransition } from 'react'
import { 
  MagnifyingGlass, 
  Plus, 
  PencilSimple, 
  Pause, 
  Play, 
  Trash,
} from '@phosphor-icons/react'
import { AdminUser, AdminUsersFilter } from '../types'
import { UserAvatar } from './user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'
import { toggleUserStatus, deleteUser } from '../actions'
import { CreateUserModal } from './create-user-modal'

interface UsersListProps {
  initialUsers: AdminUser[]
}

export function UsersList({ initialUsers }: UsersListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<AdminUsersFilter['role']>('all')
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredUsers = users.filter(user => {
    const name = user.full_name || ''
    const email = user.email || ''
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || 
                         email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleToggleStatus = (id: string, currentStatus: string) => {
    startTransition(async () => {
      const result = await toggleUserStatus(id, currentStatus)
      if (result.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } as AdminUser : u))
        toast.success('Status atualizado!')
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return

    startTransition(async () => {
      const result = await deleteUser(id)
      if (result.success) {
        setUsers(prev => prev.filter(u => u.id !== id))
        toast.success('Usuário removido!')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Buscar por nome ou email..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-white/5 rounded-lg p-1">
            {(['all', 'admin', 'barber', 'client'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                  roleFilter === role 
                    ? "bg-accent-cyan text-black" 
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {role === 'all' ? 'Todos' : role === 'admin' ? 'Admin' : role === 'barber' ? 'Barbeiro' : 'Cliente'}
              </button>
            ))}
          </div>
          
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-accent-cyan hover:bg-cyan-400 text-black">
            <Plus size={18} weight="bold" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cargo</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.full_name || ''} url={user.avatar_url} role={user.role} />
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{user.full_name}</span>
                        <span className="text-xs text-muted-foreground">{user.email || 'Sem email'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border",
                      user.role === 'admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      user.role === 'barber' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'barber' ? 'Barbeiro' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        user.status === 'active' || !user.status ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted-foreground/30"
                      )} />
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.status === 'active' || !user.status ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <PencilSimple size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                        disabled={isPending}
                        title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                        className="p-2 text-muted-foreground hover:text-accent-cyan transition-colors rounded-lg hover:bg-white/5"
                      >
                        {user.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={isPending}
                        title="Remover"
                        className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>

      <CreateUserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={(newUser) => {
          setUsers(prev => [newUser as any, ...prev])
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
