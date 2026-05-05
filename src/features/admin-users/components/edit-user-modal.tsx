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
      <div className="relative w-full max-w-xl bg-card border border-white/5 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div>
            <h2 className="text-xl font-bold font-syne text-white">Editar Usuário</h2>
            <p className="text-sm text-muted-foreground">Atualize as informações do membro da equipe</p>
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

              {/* Specialty (if barber) */}
              {user.role === 'barber' && (
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem className="animate-in slide-in-from-top-2 duration-300">
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Especialidade</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Input 
                            {...field} 
                            placeholder="Ex: Corte e Barba" 
                            className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan transition-all"
                          />
                          <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-cyan transition-colors" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                  {isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
