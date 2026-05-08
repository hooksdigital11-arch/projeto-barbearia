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
    <div className="space-y-16">
      {/* Header & Controls: Editorial & Precise */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="relative flex-1 max-w-2xl group">
          <MagnifyingGlass className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-cyan transition-colors" size={20} />
          <input
            placeholder="Buscar por nome ou email..."
            className="w-full pl-16 pr-8 py-5 bg-black border border-white/[0.06] rounded-full text-base font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-sans"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex gap-2 p-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full">
            {(['all', 'admin', 'barber', 'client'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                  roleFilter === role
                    ? "bg-accent-cyan text-black"
                    : "text-text-muted hover:text-white hover:bg-white/5"
                )}
              >
                {role === 'all' ? 'Todos' : role === 'admin' ? 'Admin' : role === 'barber' ? 'Barbeiro' : 'Cliente'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shrink-0 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
          >
            <Plus size={16} weight="bold" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Table: Zero Shadows, Pure Borders */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Usuário</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Cargo</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Status</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <UserAvatar name={user.full_name || ''} url={user.avatar_url} role={user.role} />
                      <div className="flex flex-col space-y-1.5">
                        <span className="font-bold text-white text-lg tracking-tight group-hover:text-accent-cyan transition-colors">{user.full_name}</span>
                        <span className="text-[10px] font-bold text-text-muted font-mono tracking-tight">{user.email || 'SEM EMAIL CADASTRADO'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                      user.role === 'admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        user.role === 'barber' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    )}>
                      {user.role === 'admin' ? 'Administrador' : user.role === 'barber' ? 'Barbeiro' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        user.status === 'active' || !user.status
                          ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          : "bg-white/10"
                      )} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted font-mono">
                        {user.status === 'active' || !user.status ? 'On-line' : 'Off-line'}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button
                        onClick={() => handleEdit(user)}
                        title="Editar"
                        className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-white transition-all rounded-full border border-white/5 hover:border-accent-cyan/40 hover:bg-accent-cyan/5"
                      >
                        <PencilSimple size={18} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                        disabled={isPending}
                        title={user.status === 'active' ? 'Desativar' : 'Ativar'}
                        className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-accent-cyan transition-all rounded-full border border-white/5 hover:border-accent-cyan/40 hover:bg-accent-cyan/5"
                      >
                        {user.status === 'active' ? <Pause size={18} weight="bold" /> : <Play size={18} weight="bold" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isPending}
                        title="Remover"
                        className="w-11 h-11 flex items-center justify-center text-text-muted hover:text-red-400 transition-all rounded-full border border-white/5 hover:border-red-400/40 hover:bg-red-400/5"
                      >
                        <Trash size={18} weight="bold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-40 text-center flex flex-col items-center justify-center gap-8">
            <div className="w-1.5 h-12 bg-white/5" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted">Nenhum registro encontrado</p>
          </div>
        )}
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
