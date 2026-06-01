'use client'

import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Eye,
  EyeSlash,
  EnvelopeSimple,
  LockSimple,
  CircleNotch,
  GoogleLogo,
  ArrowRight,
} from '@phosphor-icons/react'
import { login } from '../actions'
import { loginSchema, type LoginInput } from '../schemas'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  function onSubmit(data: LoginInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('rememberMe', String(data.rememberMe))
      const result = await login(formData)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>

        {/* Header */}
        <div className="mb-10">
          <p className="font-mono text-[9px] uppercase tracking-[0.42em] text-accent-main mb-4">
            Login
          </p>
          <h2
            className="font-syne font-medium uppercase leading-none tracking-[-0.03em] text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 2.4rem)' }}
          >
            Bem-vindo.
          </h2>
          <p className="font-mono text-[10px] text-white/28 uppercase tracking-[0.2em] leading-[2]">
            Sem conta?{' '}
            <Link
              href="/signup"
              className="text-accent-main hover:text-accent-main/70 transition-colors duration-300"
            >
              Criar agora
            </Link>
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-7">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/28 mb-[7px] block">
                  Email
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-main transition-colors duration-300">
                      <EnvelopeSimple size={14} />
                    </div>
                    <input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      disabled={isPending}
                      className="w-full h-[48px] pl-[42px] pr-4 bg-white/[0.04] border border-white/[0.07] rounded-[10px] font-mono text-[12px] text-white placeholder:text-white/18 focus:outline-none focus:border-accent-main/30 focus:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="font-mono text-[10px] text-red-400/70 mt-1.5 ml-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/28 mb-[7px] block">
                  Senha
                </FormLabel>
                <FormControl>
                  <div className="relative group">
                    <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-main transition-colors duration-300">
                      <LockSimple size={14} />
                    </div>
                    <input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isPending}
                      className="w-full h-[48px] pl-[42px] pr-12 bg-white/[0.04] border border-white/[0.07] rounded-[10px] font-mono text-[12px] text-white placeholder:text-white/18 focus:outline-none focus:border-accent-main/30 focus:bg-white/[0.06] transition-all duration-300 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      disabled={isPending}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-[14px] top-1/2 -translate-y-1/2 text-white/20 hover:text-white/45 transition-colors duration-300"
                    >
                      {showPassword ? <EyeSlash size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="font-mono text-[10px] text-red-400/70 mt-1.5 ml-1" />
              </FormItem>
            )}
          />
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between mb-8">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2.5 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    className="w-[13px] h-[13px] rounded-[3px] border border-white/[0.15] bg-transparent accent-[#00d4aa] cursor-pointer"
                  />
                </FormControl>
                <FormLabel className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/22 cursor-pointer hover:text-white/40 transition-colors duration-300">
                  Lembrar
                </FormLabel>
              </FormItem>
            )}
          />
          <Link
            href="/recovery"
            className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent-main/50 hover:text-accent-main transition-colors duration-300"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-[48px] bg-accent-main text-black font-mono text-[10px] uppercase tracking-[0.22em] font-medium rounded-full hover:opacity-90 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2.5 mb-6"
        >
          {isPending ? (
            <>
              <CircleNotch size={13} className="animate-spin" />
              <span>Validando...</span>
            </>
          ) : (
            <>
              <span>Entrar</span>
              <ArrowRight size={12} weight="bold" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="font-mono text-[8px] uppercase tracking-[0.35em] text-white/18">ou</span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={() => toast.info('Login com Google em breve!')}
          className="w-full h-[48px] flex items-center justify-center gap-3 border border-white/[0.07] rounded-full font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 hover:text-white/65 hover:border-white/14 transition-all duration-300"
        >
          <GoogleLogo size={14} />
          <span>Continuar com Google</span>
        </button>

      </form>
    </Form>
  )
}
