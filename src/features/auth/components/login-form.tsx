'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeSlash, EnvelopeSimple, LockSimple, CircleNotch, Scissors, GoogleLogo } from '@phosphor-icons/react'
import { login } from '../actions'
import { loginSchema, type LoginInput } from '../schemas'
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
 * LoginForm Component
 * Premium centered login form with barber identity.
 * Inspired by circuit-board aesthetic, adapted for barbershop SaaS.
 */
export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('rememberMe', String(data.rememberMe))

      const result = await login(formData)

      if (result?.error) {
        toast.error(result.error)
      }
      // Se não retornou error, o redirect já aconteceu no server action
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >

        {/* === LOGO + HEADER === */}
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Barber icon badge */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-main/20 to-accent-main/5 border border-accent-main/20 flex items-center justify-center backdrop-blur-sm">
              <Scissors size={28} weight="bold" className="text-accent-main" />
            </div>
            {/* Decorative dots around icon */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-white/20"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold font-syne text-white tracking-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-text-secondary">
              Ainda não tem uma conta?{' '}
              <Link
                href="/signup"
                className="text-white font-semibold underline underline-offset-4 decoration-accent-main/50 hover:decoration-accent-main transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* === FORM FIELDS === */}
        <div className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="sr-only">Email</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-main transition-colors duration-200">
                      <EnvelopeSimple size={18} weight="bold" />
                    </div>
                    <Input
                      {...field}
                      type="email"
                      placeholder="endereço de email"
                      disabled={isPending}
                      className="h-[52px] pl-11 pr-4 bg-[#141414] border-white/[0.06] rounded-xl text-sm text-white placeholder:text-text-secondary focus:border-accent-main/40 focus:bg-[#161616] transition-all duration-200"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs mt-1.5 ml-1" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="sr-only">Senha</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-main transition-colors duration-200">
                      <LockSimple size={18} weight="bold" />
                    </div>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Senha"
                      disabled={isPending}
                      className="h-[52px] pl-11 pr-12 bg-[#141414] border-white/[0.06] rounded-xl text-sm text-white placeholder:text-text-secondary focus:border-accent-main/40 focus:bg-[#161616] transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                      disabled={isPending}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeSlash size={18} weight="bold" />
                      ) : (
                        <Eye size={18} weight="bold" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 text-xs mt-1.5 ml-1" />
              </FormItem>
            )}
          />
        </div>

        {/* === REMEMBER ME + FORGOT === */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2.5 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    className="w-4 h-4 rounded border-white/20 data-[state=checked]:bg-accent-main data-[state=checked]:border-accent-main"
                  />
                </FormControl>
                <FormLabel className="text-xs text-text-secondary cursor-pointer hover:text-white/70 transition-colors">
                  Lembrar acesso
                </FormLabel>
              </FormItem>
            )}
          />
          <Link
            href="/recovery"
            className="text-xs text-accent-main hover:text-accent-main/80 transition-colors font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {/* === LOGIN BUTTON === */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-[52px] bg-accent-main hover:bg-accent-main/90 text-black font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] text-sm tracking-wide disabled:opacity-50"
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2.5">
              <CircleNotch size={18} className="animate-spin" />
              <span>Validando...</span>
            </div>
          ) : (
            'Login'
          )}
        </Button>

        {/* === DIVIDER === */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.06]" />
          </div>
          <span className="relative bg-[#0d0d0d] px-4 text-[11px] text-text-secondary uppercase tracking-widest font-medium">
            ou
          </span>
        </div>

        {/* === SOCIAL LOGIN === */}
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-3 h-[52px] rounded-xl border border-white/[0.06] bg-[#141414] hover:bg-[#1a1a1a] hover:border-white/[0.12] transition-all duration-200 text-sm text-white/80 font-medium active:scale-[0.98]"
            onClick={() => toast.info('Login com Google em breve!')}
          >
            <GoogleLogo size={20} weight="bold" />
            <span>Continuar com Google</span>
          </button>
        </div>

      </form>
    </Form>
  )
}
