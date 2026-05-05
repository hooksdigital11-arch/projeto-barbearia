'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Envelope, Phone, Article, Lock, FloppyDisk, CircleNotch, SignOut } from '@phosphor-icons/react'
import { adminProfileSchema, type AdminProfileInput } from '../schemas'
import { updateAdminProfile } from '../actions'
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

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-accent-gradient p-[2px] shadow-2xl shadow-accent-cyan/20">
              <div className="w-full h-full rounded-[22px] bg-bg-secondary flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                {initialData?.full_name?.[0] || 'A'}
              </div>
            </div>
            <button className="absolute -bottom-2 -right-2 p-2 bg-accent-cyan text-black rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
              <PencilSimple size={16} weight="bold" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold font-syne text-white">{initialData?.full_name}</h2>
            <p className="text-muted-foreground uppercase text-xs font-bold tracking-widest mt-1">Administrador Master</p>
          </div>
        </div>

        <Button 
          variant="ghost" 
          onClick={() => logout()}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2 rounded-xl"
        >
          <SignOut size={18} />
          Encerrar Sessão
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seu Nome</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan" />
                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email de Acesso</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} type="email" disabled className="pl-10 bg-black/20 border-white/10 opacity-50 cursor-not-allowed" />
                        <Envelope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <p className="text-[10px] text-muted-foreground italic">O email não pode ser alterado por aqui.</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Telefone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan" />
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Biografia / Notas</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <textarea 
                          {...field} 
                          rows={2}
                          className="w-full pl-10 p-3 bg-black/20 border border-white/10 rounded-xl focus:border-accent-cyan outline-none text-sm transition-all"
                        />
                        <Article size={18} className="absolute left-3 top-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                <Lock size={20} weight="duotone" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Segurança da Conta</p>
                <button type="button" className="text-xs text-accent-cyan hover:underline">Alterar senha de acesso</button>
              </div>
            </div>

            <Button disabled={isPending} className="w-full md:w-auto bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 px-8 py-6 rounded-2xl text-base shadow-lg shadow-cyan-500/20">
              {isPending ? <CircleNotch size={20} className="animate-spin" /> : <FloppyDisk size={20} />}
              Atualizar Perfil
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

import { PencilSimple } from '@phosphor-icons/react'
