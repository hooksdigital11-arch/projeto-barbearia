'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface RoleRedirectProps {
  role: string
  adminPath: string
  barberPath: string
  clientPath: string
}

/**
 * Handles role-based redirection on the client-side to avoid NEXT_REDIRECT errors
 * that pollute the server console during SSR/prefetching in Next.js 15.
 */
export function RoleRedirect({ role, adminPath, barberPath, clientPath }: RoleRedirectProps) {
  const router = useRouter()

  useEffect(() => {
    if (role === 'admin') {
      router.replace(adminPath)
    } else if (role === 'barber') {
      router.replace(barberPath)
    } else {
      router.replace(clientPath)
    }
  }, [role, adminPath, barberPath, clientPath, router])

  // Retorna null pois não queremos renderizar nada, apenas redirecionar
  return null
}
