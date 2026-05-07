'use client'

import { useTransition, useState } from 'react'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'

import { toast } from 'sonner'

import Link from 'next/link'

import { Eye, EyeSlash, EnvelopeSimple, LockSimple, CircleNotch } from '@phosphor-icons/react'

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

* Handles user authentication with real-time validation and loading feedback.

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

        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-5xl font-black font-syne text-white tracking-tighter leading-none">
            Bem-vindo <span className="text-accent-cyan">de volta</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed">
            Acesse sua conta para gerenciar sua barbearia com excelência.
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-cyan ml-1">Email Profissional</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      type="email"
                      placeholder="exemplo@barberpro.com"
                      disabled={isPending}
                      className="glass-input pl-14 h-14 text-base"
                    />
                    <div className="absolute left-0 top-0 h-full w-14 flex items-center justify-center text-text-secondary group-focus-within:text-accent-cyan transition-colors">
                      <EnvelopeSimple size={24} weight="bold" />
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 font-bold text-xs" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">Senha de Acesso</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isPending}
                      className="glass-input pl-14 pr-14 h-14 text-base"
                    />
                    <div className="absolute left-0 top-0 h-full w-14 flex items-center justify-center text-text-secondary group-focus-within:text-accent-cyan transition-colors">
                      <LockSimple size={24} weight="bold" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-full w-14 flex items-center justify-center text-text-secondary hover:text-white transition-colors p-0.5"
                      disabled={isPending}
                    >
                      {showPassword ? (
                        <EyeSlash size={24} weight="bold" />
                      ) : (
                        <Eye size={24} weight="bold" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400 font-bold text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Links Secundários */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    className="w-5 h-5 border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan rounded-lg"
                  />
                </FormControl>
                <FormLabel className="text-sm font-bold text-text-secondary cursor-pointer hover:text-white transition-colors uppercase tracking-widest text-[10px]">
                  Lembrar acesso
                </FormLabel>
              </FormItem>
            )}
          />
          <Link
            href="/recovery"
            className="text-[10px] font-black uppercase tracking-widest text-accent-cyan hover:text-cyan-300 transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isPending}
            variant="cyan"
            size="lg"
            className="w-full text-base tracking-[0.1em]"
          >
            {isPending ? (
              <div className="flex items-center justify-center space-x-3">
                <CircleNotch size={24} className="animate-spin" />
                <span className="uppercase font-black">Validando...</span>
              </div>
            ) : (
              <span className="uppercase font-black">Acessar Painel</span>
            )}
          </Button>
        </div>

        {/* Cadastro Link */}
        <div className="text-center">
          <p className="text-sm text-text-secondary font-medium">
            Ainda não faz parte da elite?{' '}
            <Link
              href="/signup"
              className="text-accent-cyan hover:text-cyan-300 font-black transition-all"
            >
              Crie sua conta agora
            </Link>
          </p>
        </div>
      </form>
    </Form>
  )
}
