import { Metadata } from 'next'
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form'

export const metadata: Metadata = {
  title: 'Redefinir Senha - Barbearia',
  description: 'Crie uma nova senha para sua conta.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
