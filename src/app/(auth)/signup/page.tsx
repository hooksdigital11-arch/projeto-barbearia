import { Metadata } from 'next'
import { SignupForm } from '@/features/auth/components/signup-form'

export const metadata: Metadata = {
  title: 'Cadastro - Barbearia',
  description: 'Crie sua conta grátis e comece a gerenciar seus clientes hoje mesmo.',
}

export default function SignupPage() {
  return <SignupForm />
}
