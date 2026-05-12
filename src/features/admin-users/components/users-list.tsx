'use client'

import { useState, useTransition } from 'react'
import {
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Pause,
  Play,
  Trash,
  Eye,
} from '@phosphor-icons/react'
import { AdminUser, AdminUsersFilter } from '../types'
import { UserAvatar } from './user-avatar'
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
      {/* Controls Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-6">
        {/* Search Box - Larger */}
        <div className="relative w-full lg:max-w-md">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2e2e2e]" size={16} />
          <input
            placeholder="Buscar usuário por nome ou email..."
            className="w-full pl-10 pr-4 py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-primary placeholder:text-[#2e2e2e] focus:outline-none focus:border-accent-main/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tabs - Centered */}
        <div className="flex justify-center">
          <div className="flex bg-bg-black border border-border-main/50 rounded-full p-1 h-fit">
            {(['all', 'admin', 'barber', 'client'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider transition-all",
                  roleFilter === role
                    ? "bg-bg-surface text-accent-main border border-accent-main/10"
                    : "text-[#333] hover:text-[#666]"
                )}
              >
                {role === 'all' ? 'TODOS' : role === 'admin' ? 'ADMIN' : role === 'barber' ? 'BARBEIRO' : 'CLIENTE'}
              </button>
            ))}
          </div>
        </div>

        {/* Button - Right Aligned */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-accent-main text-black px-5 py-[11px] rounded-[8px] text-[10px] font-medium uppercase tracking-[0.08em] hover:opacity-90 transition-all shrink-0"
          >
            <Plus size={14} weight="bold" />
            Novo Usuário
          </button>
        </div>
      </div>

      {/* Modern Table Grid */}
      <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2.2fr_1fr_100px_80px] gap-[12px] px-5 py-3 border-b-[0.5px] border-border-main/50 items-center">
          <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#2a2a2a]">Usuário</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#2a2a2a]">Cargo</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#2a2a2a]">Status</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#2a2a2a] text-right">Ações</span>
        </div>

        {/* Table Rows */}
        <div className="flex flex-col">
          {filteredUsers.map((user, idx) => (
            <div 
              key={user.id} 
              className={cn(
                "grid grid-cols-[2.2fr_1fr_100px_80px] gap-[12px] px-5 py-3.5 items-center hover:bg-bg-surface transition-all",
                idx !== filteredUsers.length - 1 && "border-bottom-[0.5px] border-border-main"
              )}
              style={{ borderBottom: idx !== filteredUsers.length - 1 ? '0.5px solid #141414' : 'none' }}
            >
              {/* User Info */}
              <div className="flex items-center gap-3">
                <UserAvatar name={user.full_name || ''} url={user.avatar_url} />
                <div className="flex flex-col truncate">
                  <span className="text-[13px] font-medium text-text-primary truncate uppercase">{user.full_name}</span>
                  <span className="text-[9px] text-[#2a2a2a] truncate uppercase tracking-wider">{user.email || 'sem email'}</span>
                </div>
              </div>

              {/* Role Badge */}
              <div>
                <span className={cn(
                  "px-[10px] py-[3px] rounded-[5px] text-[9px] font-medium uppercase tracking-[0.07em] border-[0.5px]",
                  user.role === 'admin' ? "bg-[#1a0d2e] text-[#9b7cf6] border-[#9b7cf633]" :
                    user.role === 'barber' ? "bg-[#0d1e2e] text-[#6b9fff] border-[#6b9fff33]" :
                      "bg-[#0d2e1a] text-[#00c070] border-[#00c07033]"
                )}>
                  {user.role === 'admin' ? 'Administrador' : user.role === 'barber' ? 'Barbeiro' : 'Cliente'}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-[6px] h-[6px] rounded-full",
                  user.status === 'active' || !user.status ? "bg-accent-main" : "bg-[#2a2a2a]"
                )} />
                <span className={cn(
                  "text-[10px] tracking-[0.06em] uppercase transition-colors",
                  user.status === 'active' || !user.status ? "text-accent-main" : "text-[#444]"
                )}>
                  {user.status === 'active' || !user.status ? 'On-line' : 'Pausado'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-[10px]">
                <button 
                  onClick={() => handleEdit(user)}
                  title="Editar" 
                  className="w-[30px] h-[30px] rounded-full border-[0.5px] border-border-main bg-bg-sidebar flex items-center justify-center text-[#3d3d3d] hover:border-[#2a2a2a] hover:text-[#777] transition-all"
                >
                  <PencilSimple size={13} weight="bold" />
                </button>
                <button 
                  onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                  disabled={isPending}
                  title={user.status === 'active' ? 'Pausar' : 'Ativar'}
                  className="w-[30px] h-[30px] rounded-full border-[0.5px] border-border-main bg-bg-sidebar flex items-center justify-center text-[#3d3d3d] hover:border-[#2a2a2a] hover:text-[#777] transition-all disabled:opacity-30"
                >
                  {user.status === 'active' ? <Pause size={13} weight="bold" /> : <Play size={13} weight="bold" />}
                </button>
                <button 
                  onClick={() => handleDelete(user.id)}
                  disabled={isPending}
                  title="Excluir" 
                  className="w-[30px] h-[30px] rounded-full border-[0.5px] border-border-main bg-bg-sidebar flex items-center justify-center text-[#3d3d3d] hover:border-[#2a2a2a] hover:text-[#ef4444] transition-all disabled:opacity-30"
                >
                  <Trash size={13} weight="bold" />
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-px h-8 bg-[#161616]" />
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#333]">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
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
