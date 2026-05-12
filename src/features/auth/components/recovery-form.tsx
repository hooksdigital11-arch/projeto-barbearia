'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { EnvelopeSimple, CircleNotch, ArrowLeft } from '@phosphor-icons/react'
import { requestPasswordReset } from '../actions'
import { recoverySchema, type RecoveryInput } from '../schemas'
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

/**
 * RecoveryForm Component
 * Simplistic flow to request a password reset link via email.
 */
export function RecoveryForm() {
  const [isPending, startTransition] = useTransition()

  const form = useForm<RecoveryInput>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(data: RecoveryInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)

      const result = await requestPasswordReset(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Link de recuperação enviado! Verifique seu email. 📧')
        form.reset()
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {/* Header */}
        <div className="space-y-3">
          <Link 
            href="/login" 
            className="inline-flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors gap-1.5 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar ao login
          </Link>
          <h1 className="text-4xl font-bold font-syne text-text-primary tracking-tight">
            Recuperar Acesso
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esqueceu sua senha? Não se preocupe. Digite seu email e enviaremos um link para você redefinir seu acesso com segurança.
          </p>
        </div>

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-text-primary text-sm font-medium">Email de Cadastro</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    {...field}
                    type="email"
                    placeholder="seu@email.com"
                    disabled={isPending}
                    className="pl-11 h-12 bg-card/50 border-cyan-500/20 text-text-primary placeholder:text-muted-foreground/40 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  />
                  <EnvelopeSimple
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
        >
          {isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <CircleNotch size={20} className="animate-spin" />
              <span>Enviando...</span>
            </div>
          ) : (
            'Enviar Link de Recuperação'
          )}
        </Button>

        {/* Support Link */}
        <p className="text-center text-xs text-muted-foreground">
          Ainda com problemas? <Link href="#" className="text-cyan-400 font-bold hover:underline">Fale com o suporte</Link>
        </p>
      </form>
    </Form>
  )
}
