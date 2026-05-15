'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { LockKey, CircleNotch } from '@phosphor-icons/react'
import { confirmPasswordReset } from '../actions'
import { resetPasswordSchema, type ResetPasswordInput } from '../schemas'
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

export function ResetPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  function onSubmit(data: ResetPasswordInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('password', data.password)
      formData.append('confirmPassword', data.confirmPassword)

      const result = await confirmPasswordReset(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Senha redefinida com sucesso!')
        router.push('/login')
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        <div className="space-y-3">
          <h1 className="text-4xl font-bold font-syne text-text-primary tracking-tight">
            Nova Senha
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Escolha uma nova senha segura para sua conta.
          </p>
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-text-primary text-sm font-medium">Nova Senha</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    {...field}
                    type="password"
                    placeholder="Mínimo de 8 caracteres"
                    disabled={isPending}
                    className="pl-11 h-12 bg-card/50 border-cyan-500/20 text-text-primary placeholder:text-muted-foreground/40 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                  <LockKey
                    size={22}
                    weight="duotone"
                    className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-cyan-500 transition-colors duration-300"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-text-primary text-sm font-medium">Confirmar Nova Senha</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    {...field}
                    type="password"
                    placeholder="Repita a nova senha"
                    disabled={isPending}
                    className="pl-11 h-12 bg-card/50 border-cyan-500/20 text-text-primary placeholder:text-muted-foreground/40 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                  <LockKey
                    size={22}
                    weight="duotone"
                    className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-cyan-500 transition-colors duration-300"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
        >
          {isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <CircleNotch size={20} className="animate-spin" />
              <span>Salvando...</span>
            </div>
          ) : (
            'Redefinir Senha'
          )}
        </Button>
      </form>
    </Form>
  )
}
