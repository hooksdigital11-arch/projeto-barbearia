'use client'

import { useTransition, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  User,
  EnvelopeSimple,
  Phone,
  LockSimple,
  Check,
  X,
  CircleNotch,
} from '@phosphor-icons/react'
import { signup } from '../actions'
import { signupSchema, type SignupInput } from '../schemas'
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

/**
 * SignupForm Component
 * Features real-time password requirement tracking and automatic phone masking.
 */
export function SignupForm() {
  const [isPending, startTransition] = useTransition()
  const [passwordReqs, setPasswordReqs] = useState({
    length: false,
    upper: false,
    number: false,
    special: false,
  })

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const password = form.watch('password')

  // Track password requirements in real-time
  useEffect(() => {
    setPasswordReqs({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    })
  }, [password])

  function onSubmit(data: SignupInput) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, key === 'acceptTerms' ? (value ? 'on' : 'off') : String(value))
      })

      const result = await signup(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Conta criada com sucesso! 🎉 Seja bem-vindo.')
        form.reset()
        // TODO: Redirecionar
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-syne text-white tracking-tight">
            Crie sua conta
          </h1>
          <p className="text-sm text-muted-foreground">
            Comece a gerir sua barbearia com tecnologia de ponta
          </p>
        </div>

        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white text-sm font-medium">Nome Completo</FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input
                    {...field}
                    placeholder="Ex: João Silva"
                    disabled={isPending}
                    className="pl-11 bg-card/50 border-cyan-500/20 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <User
                    size={20}
                    weight="duotone"
                    className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-cyan-500 transition-colors"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      disabled={isPending}
                      className="pl-11 bg-card/50 border-cyan-500/20 text-white focus:border-cyan-500 transition-all"
                    />
                    <EnvelopeSimple
                      size={20}
                      weight="duotone"
                      className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-cyan-500 transition-colors"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* Phone with Auto Mask */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium">Telefone</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      placeholder="(11) 98765-4321"
                      disabled={isPending}
                      className="pl-11 bg-card/50 border-cyan-500/20 text-white focus:border-cyan-500 transition-all"
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '')
                        if (val.length > 11) val = val.slice(0, 11)
                        if (val.length > 7) {
                          val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`
                        } else if (val.length > 2) {
                          val = `(${val.slice(0, 2)}) ${val.slice(2)}`
                        }
                        field.onChange(val)
                      }}
                    />
                    <Phone
                      size={20}
                      weight="duotone"
                      className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-cyan-500 transition-colors"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        {/* Password and Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium">Senha</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      className="pl-11 bg-card/50 border-cyan-500/20 text-white focus:border-cyan-500 transition-all"
                    />
                    <LockSimple
                      size={20}
                      weight="duotone"
                      className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-cyan-500 transition-colors"
                    />
                  </div>
                </FormControl>
                
                {/* Real-time Requirement Checklist */}
                <div className="mt-3 space-y-2 bg-black/40 p-3 rounded-lg border border-cyan-500/10">
                  {[
                    { label: '8+ caracteres', met: passwordReqs.length },
                    { label: 'Maiúscula (A-Z)', met: passwordReqs.upper },
                    { label: 'Número (0-9)', met: passwordReqs.number },
                    { label: 'Caractere especial (!@#$%)', met: passwordReqs.special },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center text-xs space-x-2 animate-in fade-in duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                      {req.met ? (
                        <Check size={14} className="text-green-500 font-bold" weight="bold" />
                      ) : (
                        <X size={14} className="text-muted-foreground/60 font-bold" weight="bold" />
                      )}
                      <span className={req.met ? 'text-green-400' : 'text-muted-foreground/60 font-medium'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-sm font-medium">Confirmar Senha</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      type="password"
                      placeholder="••••••••"
                      disabled={isPending}
                      className="pl-11 bg-card/50 border-cyan-500/20 text-white focus:border-cyan-500 transition-all"
                    />
                    <LockSimple
                      size={20}
                      weight="duotone"
                      className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-cyan-500 transition-colors"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />
        </div>

        {/* Accept Terms */}
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                  className="mt-1 border-cyan-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                />
              </FormControl>
              <div className="flex-1 text-xs text-muted-foreground leading-relaxed">
                Eu aceito os{' '}
                <Link href="#" className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline">
                  termos de uso
                </Link>{' '}
                e a{' '}
                <Link href="#" className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline">
                  política de privacidade
                </Link>
              </div>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] mt-4"
        >
          {isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <CircleNotch size={20} className="animate-spin" />
              <span>Criando conta...</span>
            </div>
          ) : (
            'Criar Conta Grátis'
          )}
        </Button>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground pt-2">
          Já tem conta?{' '}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline transition-all"
          >
            Faça login
          </Link>
        </p>
      </form>
    </Form>
  )
}
