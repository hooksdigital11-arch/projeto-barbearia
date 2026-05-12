'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, CircleNotch, FloppyDisk } from '@phosphor-icons/react'
import { updateUserSchema, type UpdateUserInput } from '../schemas'
import { updateUser } from '../actions'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { AdminUser } from '../types'
import { cn } from '@/lib/utils/cn'

interface EditUserModalProps {
  user: AdminUser | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedUser: AdminUser) => void
}

export function EditUserModal({ user, isOpen, onClose, onSuccess }: EditUserModalProps) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: '',
      fullName: '',
      email: '',
      phone: '',
      specialty: '',
    },
  })

  // Sincronizar form com o usuário selecionado
  useEffect(() => {
    if (user) {
      form.reset({
        id: user.id,
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        specialty: user.specialty || '',
      })
    }
  }, [user, form])

  function onSubmit(data: UpdateUserInput) {
    startTransition(async () => {
      const result = await updateUser(data.id, data)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Usuário atualizado com sucesso!')
        
        // Mapeia de volta para snake_case para o estado local do React
        const updatedUserResult = {
          ...user,
          full_name: data.fullName ?? user?.full_name,
          email: data.email ?? user?.email,
          phone: data.phone ?? user?.phone,
          specialty: data.specialty ?? user?.specialty,
        } as AdminUser

        onSuccess(updatedUserResult)
        onClose()
      }
    })
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[500px] bg-bg-black border border-border-main rounded-[12px] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-main/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">Editar Usuário</h2>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Perfil do Colaborador</p>
            </div>
            <button 
              onClick={onClose}
              className="w-[28px] h-[28px] flex items-center justify-center text-[#444] hover:text-text-primary hover:bg-white/5 transition-all rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Nome Completo</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        placeholder="Nome do usuário" 
                        className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-[#ef4444]" />
                  </FormItem>
                )}
              />

              {/* Email + Phone */}
              <div className="grid grid-cols-2 gap-[10px]">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Email Profissional</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          type="email"
                          placeholder="email@exemplo.com" 
                          className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[9px] text-[#ef4444]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Telefone</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          placeholder="(00) 00000-0000" 
                          className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[9px] text-[#ef4444]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Specialty (if barber) */}
              {user.role === 'barber' && (
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Especialidade</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          placeholder="Ex: Corte e Barba" 
                          className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[9px] text-[#ef4444]" />
                    </FormItem>
                  )}
                />
              )}

              {/* Footer */}
              <div className="grid grid-cols-2 gap-[10px] pt-4 border-t-[0.5px] border-border-main">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="py-[11px] rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main text-[10px] font-medium text-[#444] uppercase tracking-wider hover:bg-bg-surface transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 py-[11px] rounded-[7px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
                >
                  {isPending ? (
                    <CircleNotch size={14} className="animate-spin" />
                  ) : (
                    <>
                      <FloppyDisk size={14} weight="bold" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
