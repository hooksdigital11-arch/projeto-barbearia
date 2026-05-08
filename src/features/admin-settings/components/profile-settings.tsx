'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Envelope, Phone, Article, Lock, FloppyDisk, CircleNotch, SignOut, PencilSimple, X, Eye, EyeSlash } from '@phosphor-icons/react'
import { adminProfileSchema, type AdminProfileInput } from '../schemas'
import { updateAdminProfile, updatePassword } from '../actions'
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
import { logout } from '@/features/auth/actions'

export function ProfileSettings({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition()
  
  // Estados para o modal de alteração de senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isChangingPassword, startPasswordTransition] = useTransition()
  
  // Visibilidade de senhas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
  // Form principal
  const form = useForm<AdminProfileInput>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      fullName: initialData?.full_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      bio: initialData?.bio || '',
    },
  })

  function onSubmit(data: AdminProfileInput) {
    startTransition(async () => {
      const result = await updateAdminProfile(data)
      if (result.success) {
        toast.success('Perfil atualizado!')
      } else {
        toast.error(result.error)
      }
    })
  }

  function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      toast.error('As novas senhas não coincidem.')
      return
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    startPasswordTransition(async () => {
      const result = await updatePassword(currentPassword, newPassword)
      if (result.success) {
        toast.success('Senha alterada com sucesso!')
        setIsPasswordModalOpen(false)
      } else {
        toast.error(result.error || 'Erro ao alterar a senha.')
      }
    })
  }

  return (
    <div className="space-y-16">
      <div className="flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-accent-cyan flex items-center justify-center text-4xl font-black text-black">
              {initialData?.full_name?.[0] || 'A'}
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter leading-none">{initialData?.full_name}</h2>
            <p className="label-muted">Administrador Master</p>
          </div>
        </div>

        <button 
          onClick={() => logout()}
          className="px-6 py-2 rounded-full border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all"
        >
          Encerrar Sessão
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-10">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="label-muted">Seu Nome</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/30 transition-all" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="label-muted">Email de Acesso</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        type="email" 
                        disabled 
                        className="w-full px-6 py-4 bg-black/20 border border-white/[0.06] rounded-2xl text-sm font-medium text-white/40 cursor-not-allowed font-mono" 
                      />
                    </FormControl>
                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">Acesso restrito para alteração</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-10">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="label-muted">Telefone</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/30 transition-all font-mono" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="label-muted">Biografia / Notas</FormLabel>
                    <FormControl>
                      <textarea 
                        {...field} 
                        rows={4}
                        className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/30 transition-all resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-12 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6">
            <button 
              type="button" 
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-full border border-white/[0.06] flex items-center justify-center text-white/40 group-hover:border-accent-cyan group-hover:text-accent-cyan transition-all">
                <Lock size={20} />
              </div>
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest text-white">Segurança</p>
                <p className="text-[10px] font-medium text-text-muted group-hover:text-accent-cyan transition-colors">Alterar senha de acesso</p>
              </div>
            </button>

            <button 
              type="submit"
              disabled={isPending} 
              className="px-10 py-3.5 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Atualizar Perfil'}
            </button>
          </div>
        </form>
      </Form>

      {/* Modal de Alteração de Senha */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <div className="bg-black border border-white/[0.06] rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <div className="space-y-2">
                <h3 className="text-2xl font-black font-syne text-white uppercase tracking-tighter leading-none">Nova Senha</h3>
                <p className="label-muted">Segurança da conta</p>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="label-muted">Senha Atual</label>
                <div className="relative">
                  <input 
                    name="currentPassword" 
                    type={showCurrentPassword ? 'text' : 'password'}
                    required 
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/30 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="label-muted">Nova Senha</label>
                <div className="relative">
                  <input 
                    name="newPassword" 
                    type={showNewPassword ? 'text' : 'password'}
                    required 
                    minLength={6}
                    className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/30 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="label-muted">Confirmar Nova Senha</label>
                <input 
                  name="confirmPassword" 
                  type={showNewPassword ? 'text' : 'password'}
                  required 
                  minLength={6}
                  className="w-full px-6 py-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl text-sm font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/30 transition-all"
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="flex-1 py-3.5 rounded-full border border-white/[0.06] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                  disabled={isChangingPassword}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Atualizando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

