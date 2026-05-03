import { Metadata } from 'next'
import { RecoveryForm } from '@/features/auth/components/recovery-form'

export const metadata: Metadata = {
  title: 'Recuperar Senha - Barbearia',
  description: 'Esqueceu sua senha? Solicite um link de recuperação para seu email.',
}

export default function RecoveryPage() {
  return <RecoveryForm />
}
