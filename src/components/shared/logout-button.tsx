'use client'

import { useTransition } from 'react'
import { SignOut } from '@phosphor-icons/react'
import { logout } from '@/features/auth/actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout()
      } catch {
        // redirect() throws NEXT_REDIRECT
      }
    })
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="flex items-center gap-[7px] w-full min-h-[44px] text-[10px] font-medium text-[#7a2020] hover:text-[#c04040] transition-colors duration-200 disabled:opacity-50 tracking-[0.06em] uppercase"
    >
      <SignOut size={14} weight="regular" />
      {isPending ? 'SAINDO...' : 'SAIR DA CONTA'}
    </button>
  )
}
