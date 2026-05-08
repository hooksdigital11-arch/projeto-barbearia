'use client'

import { useEffect, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, CircleNotch, FloppyDisk, User, Envelope, Phone, Briefcase } from '@phosphor-icons/react'
import { updateUserSchema, type UpdateUserInput } from '../schemas'
import { updateUser } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
        const updatedUser = {
          ...user,
          full_name: data.fullName ?? user?.full_name,
          email: data.email ?? user?.email,
          phone: data.phone ?? user?.phone,
          specialty: data.specialty ?? user?.specialty,
        } as AdminUser

        onSuccess(updatedUser)
        onClose()
      }

    })
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-xl bg-black border border-white/[0.06] rounded-[2rem] overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="px-10 py-8 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter">Editar Usuário</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">Perfil do Colaborador</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-white transition-all rounded-full border border-white/5 hover:border-white/10"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Nome Completo</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        placeholder="Ex: Rafael Silva" 
                        className="w-full px-8 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Email Profissional</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          type="email"
                          placeholder="rafael@barbearia.com" 
                          className="w-full px-8 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-mono"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Telefone</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          placeholder="(11) 99999-9999" 
                          className="w-full px-8 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-mono"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
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
                    <FormItem className="space-y-4 animate-premium-in">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Especialidade</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          placeholder="Ex: Corte e Barba" 
                          className="w-full px-8 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                    </FormItem>
                  )}
                />
              )}

              {/* Footer Ações */}
              <div className="flex items-center justify-end gap-10 pt-10 border-t border-white/[0.06]">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-12 py-5 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.15)]"
                >
                  {isPending ? 'Salvando...' : 'Confirmar Alterações'}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
