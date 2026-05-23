'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SignOut, Lock, Key, FloppyDisk, CircleNotch, X, Eye, EyeSlash, Plus } from '@phosphor-icons/react'
import { adminProfileSchema, type AdminProfileInput } from '../schemas'
import { updateAdminProfile, updatePassword } from '../actions'
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProfileSettings({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isChangingPassword, startPasswordTransition] = useTransition()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  
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
    <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] overflow-hidden max-w-4xl">
      {/* Hero Header */}
      <div className="relative p-[22px_24px] border-b-[0.5px] border-border-main/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute left-0 top-0 w-full h-full pointer-events-none opacity-40" 
          style={{ background: 'radial-gradient(ellipse at 10% 50%, var(--accent-04, #00d4aa06), transparent)' }} />
        
        <div className="flex items-center gap-[18px] relative z-10">
          <div className="w-[56px] h-[56px] rounded-[12px] bg-[#1a1a2e] border-[0.5px] border-[#2a2a3e] flex items-center justify-center text-[20px] font-medium text-[#8b7cf6] shrink-0">
            {initialData?.full_name?.[0] || 'A'}
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[22px] font-medium text-text-primary tracking-[-0.01em] leading-tight truncate">{initialData?.full_name}</h2>
            <div className="flex items-center gap-[5px] mt-1">
              <div className="w-[5px] h-[5px] rounded-full bg-accent-main opacity-60" />
              <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/70">Administrador Master</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => logout()}
          className="flex items-center justify-center gap-2 bg-transparent border-[0.5px] border-[#3a1a1a] rounded-[7px] p-[8px_14px] text-[10px] font-medium uppercase tracking-[0.08em] text-[#c04040] hover:bg-[#1a0d0d] hover:border-[#c04040] transition-all relative z-10 w-full sm:w-auto shrink-0"
        >
          <SignOut size={14} weight="bold" />
          Encerrar Sessão
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          {/* Main Form Fields */}
          <div className="p-[22px_24px] space-y-6">
            {/* Row 1: Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Seu Nome</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[11px_14px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Telefone</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[11px_14px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Email + Bio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Email de Acesso</FormLabel>
                    <FormControl>
                      <div className="space-y-1.5">
                        <input 
                          {...field} 
                          type="email" 
                          disabled 
                          className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[11px_14px] text-[12px] text-text-muted/50 cursor-not-allowed" 
                        />
                        <p className="text-[9px] text-text-muted/40 uppercase tracking-[0.06em]">Acesso restrito para alteração</p>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Biografia / Notas</FormLabel>
                    <FormControl>
                      <textarea 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[11px_14px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all h-[40px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-bg-sidebar border-t-[0.5px] border-border-main/50 p-[16px_24px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] bg-bg-surface border-[0.5px] border-border-main rounded-[8px] flex items-center justify-center text-[#444]">
                <Lock size={16} weight="bold" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">Segurança</span>
                <span className="text-[9px] text-text-muted/40 uppercase tracking-wider mt-0.5">Mantenha sua conta protegida</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[8px_14px] text-[10px] font-medium uppercase tracking-[0.08em] text-text-nav hover:border-[#2a2a2a] hover:text-text-muted transition-all"
            >
              <Key size={14} weight="bold" />
              Atualizar Senha
            </button>
          </div>

          {/* Footer Actions */}
          <div className="p-[14px_24px] border-t-[0.5px] border-border-main/50 flex justify-end">
            <button 
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-accent-main text-black px-[18px] py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
            >
              {isPending ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <FloppyDisk size={14} weight="bold" />
              )}
              Salvar Perfil
            </button>
          </div>
        </form>
      </Form>

      {/* Modal de Alteração de Senha */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsPasswordModalOpen(false)} />
          <div className="relative w-full max-w-[400px] bg-bg-black border border-border-main rounded-[12px] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="px-6 py-5 border-b border-border-main/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">Nova Senha</h3>
                  <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/70">Segurança da conta</p>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="w-[28px] h-[28px] flex items-center justify-center text-text-muted/40 hover:text-text-primary transition-all rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Senha Atual</label>
                <div className="relative">
                  <input 
                    name="currentPassword" 
                    type={showCurrentPassword ? 'text' : 'password'}
                    required 
                    className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[11px_14px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-nav transition-colors"
                  >
                    {showCurrentPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Nova Senha</label>
                <div className="relative">
                  <input 
                    name="newPassword" 
                    type={showNewPassword ? 'text' : 'password'}
                    required 
                    minLength={6}
                    className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[11px_14px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-nav transition-colors"
                  >
                    {showNewPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-text-muted/85">Confirmar Nova Senha</label>
                <input 
                  name="confirmPassword" 
                  type={showNewPassword ? 'text' : 'password'}
                  required 
                  minLength={6}
                  className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[11px_14px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-[10px] pt-4 border-t-[0.5px] border-border-main">
                <button 
                  type="button" 
                  onClick={() => setIsPasswordModalOpen(false)} 
                  className="py-[11px] rounded-[7px] bg-bg-sidebar border-[0.5px] border-border-main text-[10px] font-medium text-text-muted hover:text-text-primary transition-all"
                  disabled={isChangingPassword}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex items-center justify-center gap-2 py-[11px] rounded-[7px] bg-accent-main text-black text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? <CircleNotch size={14} className="animate-spin" /> : <Plus size={14} weight="bold" />}
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
