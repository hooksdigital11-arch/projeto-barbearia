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

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Login realizado com sucesso! ✨')
        form.reset()
        // TODO: Redirecionar para dashboard
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-syne text-white tracking-tight">
            Entrar na Barbearia
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua agenda e clientes com facilidade
          </p>
        </div>

        {/* Email Field */}
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
                    className="pl-11 bg-card/50 border-cyan-500/20 text-white placeholder:text-muted-foreground/40 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 group-hover:border-cyan-500/40"
                  />
                  <EnvelopeSimple
                    size={22}
                    weight="duotone"
                    className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-cyan-500 transition-colors duration-300"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Password Field */}
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={isPending}
                    className="pl-11 pr-12 bg-card/50 border-cyan-500/20 text-white placeholder:text-muted-foreground/40 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 group-hover:border-cyan-500/40"
                  />
                  <LockSimple
                    size={22}
                    weight="duotone"
                    className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-cyan-500 transition-colors duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-cyan-400 transition-colors p-0.5"
                    disabled={isPending}
                  >
                    {showPassword ? (
                      <EyeSlash size={22} weight="duotone" />
                    ) : (
                      <Eye size={22} weight="duotone" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        {/* Links Secundários */}
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isPending}
                    className="border-cyan-500/50 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                </FormControl>
                <FormLabel className="text-xs text-muted-foreground cursor-pointer hover:text-white transition-colors">
                  Lembrar-me
                </FormLabel>
              </FormItem>
            )}
          />
          <Link
            href="/recovery"
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold text-base transition-all duration-300 active:scale-[0.98] disabled:opacity-50 shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_25px_rgba(0,229,255,0.5)]"
        >
          {isPending ? (
            <div className="flex items-center justify-center space-x-2">
              <CircleNotch size={20} className="animate-spin" />
              <span>Entrando...</span>
            </div>
          ) : (
            'Entrar na Barbearia'
          )}
        </Button>

        {/* Cadastro Link */}
        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{' '}
          <Link
            href="/signup"
            className="text-cyan-400 hover:text-cyan-300 font-bold underline-offset-4 hover:underline transition-all"
          >
            Crie agora
          </Link>
        </p>
      </form>
    </Form>
  )
}
