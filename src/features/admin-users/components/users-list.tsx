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
import { EditUserModal } from './edit-user-modal'

interface UsersListProps {
  initialUsers: AdminUser[]
}

export function UsersList({ initialUsers }: UsersListProps) {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<AdminUsersFilter['role']>('all')
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<AdminUser | null>(null)

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

  const handleEdit = (user: AdminUser) => {
    setUserToEdit(user)
    setIsEditModalOpen(true)
  }

  return (
    <div className="space-y-12">
      {/* Header & Controls Pro Max */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="relative flex-1 max-w-xl group/search">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-accent-cyan transition-colors" size={20} />
          <Input 
            placeholder="Buscar por nome ou email..." 
            className="pl-12 glass-input h-14 text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
            {(['all', 'admin', 'barber', 'client'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                  roleFilter === role 
                    ? "bg-white text-black shadow-2xl" 
                    : "text-muted-foreground hover:text-white"
                )}
              >
                {role === 'all' ? 'Todos' : role === 'admin' ? 'Admin' : role === 'barber' ? 'Barbeiro' : 'Cliente'}
              </button>
            ))}
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full sm:w-auto gap-3 px-8 py-7 rounded-3xl bg-accent-cyan text-black text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-all duration-500 shadow-[0_20px_40px_rgba(0,229,255,0.15)] active:scale-95 group"
          >
            <Plus size={20} weight="bold" className="group-hover:rotate-90 transition-transform duration-500" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Table Pro Max */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan/10 to-accent-blue/10 rounded-[2.5rem] blur-xl opacity-50 transition-opacity" />
        <div className="relative glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.03]">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Usuário</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Cargo</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-all duration-300 group/row">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-accent-cyan/20 rounded-2xl blur opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          <UserAvatar name={user.full_name || ''} url={user.avatar_url} role={user.role} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-base tracking-tight group-hover/row:text-accent-cyan transition-colors">{user.full_name}</span>
                          <span className="text-xs text-muted-foreground font-medium">{user.email || 'Sem email'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                        user.role === 'admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]" :
                        user.role === 'barber' ? "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" :
                        "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      )}>
                        {user.role === 'admin' ? 'Administrador' : user.role === 'barber' ? 'Barbeiro' : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full transition-all duration-500",
                          user.status === 'active' || !user.status 
                            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" 
                            : "bg-white/10"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          {user.status === 'active' || !user.status ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-white transition-all rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 active:scale-90"
                        >
                          <PencilSimple size={20} weight="bold" />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                          disabled={isPending}
                          title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-accent-cyan transition-all rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 active:scale-90"
                        >
                          {user.status === 'active' ? <Pause size={20} weight="bold" /> : <Play size={20} weight="bold" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                          title="Remover"
                          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-red-400 transition-all rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 active:scale-90"
                        >
                          <Trash size={20} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-white/10">
                <MagnifyingGlass size={32} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateUserModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(newUser) => {
            setUsers(prev => [newUser as any, ...prev])
            setIsModalOpen(false)
          }}
        />
      )}

      {isEditModalOpen && userToEdit && (
        <EditUserModal 
          user={userToEdit}
          isOpen={isEditModalOpen} 
          onClose={() => {
            setIsEditModalOpen(false)
            setUserToEdit(null)
          }} 
          onSuccess={(updatedUser) => {
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u))
          }}
        />
      )}
    </div>
  )
}
