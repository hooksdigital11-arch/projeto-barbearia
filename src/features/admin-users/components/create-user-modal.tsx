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
      <div className="relative w-full max-w-xl bg-card border border-white/5 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div>
            <h2 className="text-xl font-bold font-syne text-white">Novo Usuário</h2>
            <p className="text-sm text-muted-foreground">Cadastre um novo membro para sua equipe</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-white transition-colors rounded-full hover:bg-white/5"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nome Completo</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          {...field} 
                          placeholder="Ex: Rafael Silva" 
                          className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan transition-all"
                        />
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-cyan transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Profissional</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="rafael@barbearia.com" 
                            className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan transition-all"
                          />
                          <Envelope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-cyan transition-colors" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Telefone</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            {...field} 
                            placeholder="(11) 99999-9999" 
                            className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan transition-all"
                          />
                          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-cyan transition-colors" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Role Selector */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cargo / Role</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <select 
                            {...field}
                            className="w-full h-10 px-10 bg-black/20 border border-white/10 rounded-md text-sm focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan outline-none appearance-none transition-all"
                          >
                            <option value="barber" className="bg-bg-primary">Barbeiro</option>
                            <option value="admin" className="bg-bg-primary">Administrador</option>
                            <option value="client" className="bg-bg-primary">Cliente</option>
                          </select>
                          <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-cyan transition-colors" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Specialty (only if barber) */}
                {selectedRole === 'barber' && (
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem className="animate-in slide-in-from-top-2 duration-300">
                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Especialidade</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ex: Corte e Barba" 
                            className="bg-black/20 border-white/10 focus:border-accent-cyan transition-all"
                          />
                        </FormControl>
                        <FormMessage />
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
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Senha Temporária (Opcional)</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input 
                          {...field} 
                          type="password"
                          placeholder="Deixe vazio para gerar automaticamente" 
                          className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan transition-all"
                        />
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-cyan transition-colors" />
                      </div>
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground/60 italic">Se vazio, uma senha segura será gerada.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Auto Confirm */}
              <FormField
                control={form.control}
                name="autoConfirm"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-xs font-medium text-white cursor-pointer">
                        Confirmar email automaticamente
                      </FormLabel>
                      <p className="text-[10px] text-muted-foreground">O usuário poderá logar imediatamente.</p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Footer Ações */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="hover:bg-white/5 text-muted-foreground hover:text-white"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 min-w-[140px]"
                >
                  {isPending ? <CircleNotch size={20} className="animate-spin" /> : <FloppyDisk size={20} />}
                  {isPending ? 'Criando...' : 'Salvar Usuário'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
