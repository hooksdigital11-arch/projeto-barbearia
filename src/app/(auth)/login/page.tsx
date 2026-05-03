import { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Login - Barbearia',
  description: 'Acesse sua conta para gerenciar sua barbearia.',
}

export default function LoginPage() {
  return <LoginForm />
}
