'use client'

import { useTransition } from 'react'
import { SignOut } from '@phosphor-icons/react'
import { logout } from '@/features/auth/actions'
import { toast } from 'sonner'

/**
 * LogoutButton Component
 * Client component that triggers the logout server action.
 */
export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout()
      } catch {
        // redirect() throws NEXT_REDIRECT — this is expected behavior
      }
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-50 group"
    >
      <SignOut
        size={20}
        weight="duotone"
        className="transition-transform group-hover:-translate-x-0.5"
      />
      {isPending ? 'Saindo...' : 'Sair da conta'}
    </button>
  )
}
