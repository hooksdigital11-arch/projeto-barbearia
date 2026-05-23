'use client'

import { useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, UserPlus, CaretDown, CircleNotch } from '@phosphor-icons/react'
import { createUserSchema, type CreateUserInput } from '../schemas'
import { createUser } from '../actions'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import type { AdminUser } from '../types'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newUser: AdminUser) => void
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'barber',
      specialty: '',
      autoConfirm: true,
      password: '',
    },
  })

  const selectedRole = useWatch({
    control: form.control,
    name: 'role',
    defaultValue: 'barber'
  })

  function onSubmit(data: CreateUserInput) {
    startTransition(async () => {
      const result = await createUser(data)
      
      if (result.error) {
        toast.error(result.error)
      } else if (result.success && result.data) {
        toast.success('Usuário criado com sucesso! 🎉')
        onSuccess(result.data as AdminUser)
        form.reset()
      }
    })
  }

  if (!isOpen) return null

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
              <h2 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">Novo Usuário</h2>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Equipe & Gestão</p>
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
                        className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary placeholder:text-[#2a2a2a] focus:outline-none focus:border-accent-main/20 transition-all"
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
                      <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Email</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          type="email"
                          placeholder="email@exemplo.com" 
                          className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary placeholder:text-[#2a2a2a] focus:outline-none focus:border-accent-main/20 transition-all"
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
                          className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary placeholder:text-[#2a2a2a] focus:outline-none focus:border-accent-main/20 transition-all"
                        />
                      </FormControl>
                      <FormMessage className="text-[9px] text-[#ef4444]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Role + Specialty */}
              <div className="grid grid-cols-2 gap-[10px]">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Cargo / Role</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select 
                            {...field}
                            className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 appearance-none transition-all"
                          >
                            <option value="barber" className="bg-bg-black">Barbeiro</option>
                            <option value="admin" className="bg-bg-black">Administrador</option>
                            <option value="client" className="bg-bg-black">Cliente</option>
                          </select>
                          <CaretDown size={14} className="absolute right-[11px] top-1/2 -translate-y-1/2 text-[#333] pointer-events-none" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[9px] text-[#ef4444]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Especialidade</FormLabel>
                      <FormControl>
                        <input 
                          {...field} 
                          disabled={selectedRole !== 'barber'}
                          placeholder="Ex: Corte e Barba" 
                          className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary placeholder:text-[#2a2a2a] focus:outline-none focus:border-accent-main/20 transition-all disabled:opacity-30"
                        />
                      </FormControl>
                      <FormMessage className="text-[9px] text-[#ef4444]" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Senha Temporária</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        type="password"
                        placeholder="Deixe vazio para gerar automaticamente" 
                        className="w-full px-[14px] py-[11px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] text-[12px] text-text-secondary placeholder:text-[#2a2a2a] focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <p className="text-[9px] text-[#2a2a2a] uppercase tracking-[0.05em]">Senha automática recomendada para segurança inicial</p>
                    <FormMessage className="text-[9px] text-[#ef4444]" />
                  </FormItem>
                )}
              />

              {/* Auto Confirm Checkbox */}
              <FormField
                control={form.control}
                name="autoConfirm"
                render={({ field }) => (
                  <FormItem className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[13px_14px] flex items-start gap-[11px] space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-4 h-4 border-[0.5px] border-[#2a2a2a] rounded-[4px] bg-bg-surface data-[state=checked]:bg-accent-main data-[state=checked]:border-accent-main transition-all"
                      />
                    </FormControl>
                    <div className="flex flex-col space-y-1">
                      <FormLabel className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted cursor-pointer leading-none">
                        Confirmar acesso imediato
                      </FormLabel>
                      <p className="text-[9px] text-[#2a2a2a] leading-none">O usuário poderá logar sem validar o email manualmente.</p>
                    </div>
                  </FormItem>
                )}
              />

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
                      <UserPlus size={14} weight="bold" />
                      Criar Usuário
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
