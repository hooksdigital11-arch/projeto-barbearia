'use client'

import { useState, useTransition } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, CircleNotch, FloppyDisk, User, Envelope, Phone, Briefcase, Lock } from '@phosphor-icons/react'
import { createUserSchema, type CreateUserInput } from '../schemas'
import { createUser } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils/cn'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newUser: any) => void
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
      } else {
        toast.success('Usuário criado com sucesso! 🎉')
        onSuccess(result.data)
        form.reset()
      }
    })
  }

  if (!isOpen) return null

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
              <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter">Novo Usuário</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">Equipe & Gestão</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Role Selector */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Cargo / Role</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <select 
                            {...field}
                            className="w-full h-[64px] px-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-base font-bold text-white focus:outline-none focus:border-accent-cyan/40 appearance-none transition-all font-mono"
                          >
                            <option value="barber" className="bg-black">Barbeiro</option>
                            <option value="admin" className="bg-black">Administrador</option>
                            <option value="client" className="bg-black">Cliente</option>
                          </select>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                    </FormItem>
                  )}
                />

                {/* Specialty (only if barber) */}
                {selectedRole === 'barber' && (
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
              </div>

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Senha Temporária</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        type="password"
                        placeholder="Deixe vazio para gerar automaticamente" 
                        className="w-full px-8 py-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-mono"
                      />
                    </FormControl>
                    <p className="text-[9px] text-text-muted uppercase tracking-[0.2em] font-black">Senha automática recomendada para segurança inicial</p>
                    <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                  </FormItem>
                )}
              />

              {/* Auto Confirm */}
              <FormField
                control={form.control}
                name="autoConfirm"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-4 space-y-0 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="w-6 h-6 border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                      />
                    </FormControl>
                    <div className="space-y-1.5 leading-none">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-white cursor-pointer">
                        Confirmar acesso imediato
                      </FormLabel>
                      <p className="text-[10px] text-text-muted font-medium">O usuário poderá logar sem validar o email manualmente.</p>
                    </div>
                  </FormItem>
                )}
              />

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
                  {isPending ? 'Processando...' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
